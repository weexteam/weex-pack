const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const inquirer = require('inquirer')
const fs = require('fs');
const utils = require('../utils')
const {Config,iOSConfigResolver} = require('../utils/config')
const startJSServer = require('../run/server')
/**
 * Run iOS app
 * @param {Object} options
 */
function buildIOS(options) {
  utils.checkAndInstallForIosDeploy()
    .then(utils.buildJS)
    .then(()=>{
      return utils.exec('rsync  -r -q ./dist/* platforms/ios/bundlejs/')
    })
    .then(()=>{
      startJSServer()
      return {options}
    })
    .then(prepareIOS)
    .then(installDep)
    .then(resolveConfig)
    .then(doBuild)
    .catch((err) => {
      if (err) {
        console.log(err)
      }
    })
}

/**
 * Prepare
 * @param {Object} options
 */
function prepareIOS({options}) {
  return new Promise((resolve, reject) => {
    const rootPath = process.cwd()
    if (!utils.checkIOS(rootPath)) {
      console.log()
      console.log(chalk.red('  iOS project not found !'))
      console.log()
      console.log(`  You should run ${chalk.blue('weexpack init')} first`)
      reject()
    }

    // change working directory to ios
    // process.chdir(path.join(rootPath, 'ios/playground'))
    process.chdir(path.join(rootPath, 'platforms/ios'))

    const xcodeProject = utils.findXcodeProject(process.cwd())

    if (xcodeProject) {
      console.log()
      resolve({xcodeProject, options, rootPath})
    } else {
      console.log()
      console.log(`  ${chalk.red.bold('Could not find Xcode project files in ios folder')}`)
      console.log()
      console.log(`  Please make sure you have installed iOS Develop Environment and CocoaPods`)
      console.log(`  See ${chalk.cyan('http://alibaba.github.io/weex/doc/advanced/integrate-to-ios.html')}`)
      reject()
    }
  })
}

/**
 * Install dependency
 * @param {Object} xcode project
 * @param {Object} options
 */
function installDep({xcodeProject, options,rootPath}) {
  return new Promise((resolve, reject) => {
    try {
      console.log(` => ${chalk.blue.bold('pod install')}`)
      let child = child_process.exec('pod install --no-repo-update', {encoding: 'utf8'}, function () {
        resolve({xcodeProject, options, rootPath})
      });
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)
    } catch (e) {
      reject(e)
    }

  })

}
function resolveConfig({xcodeProject, options,rootPath}) {
  let iOSConfig = new Config(iOSConfigResolver,path.join(rootPath, 'ios.config.json'))
  return iOSConfig.getConfig().then((config) => {
    iOSConfigResolver.resolve(config);
    fs.writeFileSync(path.join(process.cwd(), 'bundlejs/index.js'),fs.readFileSync(path.join(process.cwd(), '../../dist', config.WeexBundle.replace(/\.we$/, '.js'))));
    return {};
  })
}
function doBuild() {
  return new Promise((resolve, reject)=> {
    let child = child_process.exec(path.join(__dirname, 'lib/cocoapods-build') + ' . Debug', {encoding: 'utf8'}, function () {
      console.log('Build success!');
      resolve();
    })
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

  });
}
/**
 * find ios devices
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Array} devices lists
 */
function findIOSDevice({xcodeProject, options}) {
  return new Promise((resolve, reject) => {
    let deviceInfo = ''
    try {
      deviceInfo = child_process.execSync('xcrun instruments -s devices', {encoding: 'utf8'})
    } catch (e) {
      reject(e)
    }
    let devicesList = utils.parseIOSDevicesList(deviceInfo)
    resolve({devicesList, xcodeProject, options})
  })
}

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Object} device
 */
function chooseDevice({devicesList, xcodeProject, options}) {
  return new Promise((resolve, reject) => {
    if (devicesList && devicesList.length > 0) {
      const listNames = [new inquirer.Separator(' = devices = ')]
      for (const device of devicesList) {
        listNames.push(
          {
            name: `${device.name} ios: ${device.version}`,
            value: device
          }
        )
      }

      inquirer.prompt([
          {
            type: 'list',
            message: 'Choose one of the following devices',
            name: 'chooseDevice',
            choices: listNames
          }
        ])
        .then((answers) => {
          const device = answers.chooseDevice
          resolve({device, xcodeProject, options})
        })
    } else {
      reject('No ios devices found.')
    }
  })
}

/**
 * build the iOS app on simulator or real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function buildApp({device, xcodeProject, options}) {
  return new Promise((resolve, reject) => {
    let projectInfo = ''
    try {
      projectInfo = child_process.execSync('xcodebuild -list -json', {encoding: 'utf8'})
    } catch (e) {
      reject(e)
    }
    projectInfo = JSON.parse(projectInfo)

    const scheme = projectInfo.project.schemes[0]

    if (device.isSimulator) {
      _buildOnSimulator({scheme, device, xcodeProject, options, resolve, reject})
    } else {
      _buildOnRealDevice({scheme, device, xcodeProject, options, resolve, reject})
    }
  })
}

/**
 * build the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function _buildOnSimulator({scheme, device, xcodeProject, options, resolve, reject}) {
  console.log('project is building ...')
  let buildInfo = ''
  try {
    buildInfo = child_process.execSync(`xcodebuild -${xcodeProject.isWorkspace ? 'workspace' : 'project'} ${xcodeProject.name} -scheme ${scheme} -configuration Debug -destination id=${device.udid} -sdk iphonesimulator -derivedDataPath build clean build`, {encoding: 'utf8'})
  } catch (e) {
    reject(e)
  }
  resolve({device, xcodeProject, options})
}

/**
 * build the iOS app on real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function _buildOnRealDevice({scheme, device, xcodeProject, options, resolve, reject}) {
  // @TODO support debug on real device
  reject('Weex-Pack don\'t support debug on real device. see you next version!')
}

/**
 * Run the iOS app on simulator or device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function runApp({device, xcodeProject, options}) {
  return new Promise((resolve, reject) => {
    if (device.isSimulator) {
      _runAppOnSimulator({device, xcodeProject, options, resolve, reject})
    } else {
      _runAppOnDevice({device, xcodeProject, options, resolve, reject})
    }
  })
}

/**
 * Run the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function _runAppOnSimulator({device, xcodeProject, options, resolve, reject}) {
  const inferredSchemeName = path.basename(xcodeProject.name, path.extname(xcodeProject.name))
  const appPath = `build/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`
  const bundleID = child_process.execFileSync(
    '/usr/libexec/PlistBuddy',
    ['-c', 'Print:CFBundleIdentifier', path.join(appPath, 'Info.plist')],
    {encoding: 'utf8'}
  ).trim()

  let simctlInfo = ''
  try {
    simctlInfo = child_process.execSync('xcrun simctl list --json devices', {encoding: 'utf8'})
  } catch (e) {
    reject(e)
  }
  simctlInfo = JSON.parse(simctlInfo)

  if (!simulatorIsAvailable(simctlInfo, device)) {
    reject('simulator is not available!')
  }

  console.log(`Launching ${device.name}...`)

  try {
    child_process.execSync(`xcrun instruments -w ${device.udid}`, {encoding: 'utf8'})
  } catch (e) {
    // instruments always fail with 255 because it expects more arguments,
    // but we want it to only launch the simulator
  }

  console.log(`Installing ${appPath}`)

  try {
    child_process.execSync(`xcrun simctl install booted ${appPath}`, {encoding: 'utf8'})
  } catch (e) {
    reject(e)
  }

  try {
    child_process.execSync(`xcrun simctl launch booted ${bundleID}`, {encoding: 'utf8'})
  } catch (e) {
    reject(e)
  }

  resolve()
}

/**
 * check simulator is available
 * @param {JSON} info simulator list
 * @param {Object} device user choose one
 * @return {boolean} simulator is available
 */
function simulatorIsAvailable(info, device) {
  info = info.devices
  simList = info['iOS ' + device.version]
  for (const sim of simList) {
    if (sim.udid === device.udid) {
      return sim.availability === '(available)'
    }
  }
}

/**
 * Run the iOS app on device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function _runAppOnDevice({device, xcodeProject, options, resolve, reject}) {
  // @TODO support run on real device
  const appPath = `build/Debug-iphoneos/WeexDemo.app`
  try {
    child_process.execSync(`ios-deploy --justlaunch --debug --bundle ${appPath}`, {encoding: 'utf8'})
  } catch (e) {
    console.log(e)
    reject(e)
  }
  // reject('Weex-Pack don\'t support run on real device. see you next version!')
}


module.exports = buildIOS
