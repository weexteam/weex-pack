const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const inquirer = require('inquirer')
const fs = require('fs')
const utils = require('../utils')
const startJSServer = require('./server')
const {Config,iOSConfigResolver} = require('../utils/config')
/**
 * Run iOS app
 * @param {Object} options
 */
function runIOS(options) {
  utils.checkAndInstallForIosDeploy()
    .then(utils.buildJS)
    .then(()=>{
      return utils.exec('rsync  -r -q ./dist/* platforms/ios/bundlejs/')
    })
    .then(()=> {
      startJSServer()
      return {options}
    }).then(prepareIOS)
     .then(installDep)
    .then(findIOSDevice)
    .then(chooseDevice)
    .then(buildApp)
    .then(runApp)
    .catch((err) => {
      if (err) {
        try {
          if(err.stderr){
            console.log(err.stderr)
          }
          else{
            console.log(err);
          }
          if(err.output)console.log(err.output.join('\n'))
        }catch(e){
          console.log(e);
        }
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
      console.log(`  You should run ${chalk.blue('weexpack create')} or ${chalk.blue('weexpack platform add ios')} first`)
      reject()
    }

    // change working directory to ios
    process.chdir(path.join(rootPath, 'platforms/ios'))

    const xcodeProject = utils.findXcodeProject(process.cwd())

    if (xcodeProject) {
      console.log()
      console.log(` => ${chalk.blue.bold('Will start iOS app')}`)
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
  console.log(` => ${chalk.blue.bold('pod update')}`)
  return utils.exec('pod update').then(()=>({xcodeProject, options, rootPath}))
}

/**
 * find ios devices
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Array} devices lists
 */
function findIOSDevice({xcodeProject, options,rootPath}) {
  return new Promise((resolve, reject) => {
    let deviceInfo = ''
    try {
      deviceInfo = child_process.execSync('xcrun instruments -s devices', {encoding: 'utf8'})
    } catch (e) {
      reject(e)
    }
    let devicesList = utils.parseIOSDevicesList(deviceInfo)
    resolve({devicesList, xcodeProject, options, rootPath})
  })
}

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Object} device
 */
function chooseDevice({devicesList, xcodeProject, options,rootPath}) {
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
          resolve({device, xcodeProject, options, rootPath})
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
function buildApp({device, xcodeProject, options,rootPath}) {
  return new Promise((resolve, reject) => {
    let projectInfo = ''
    try {
      projectInfo = utils.getIOSProjectInfo();
    } catch (e) {
      reject(e)
    }

    const scheme = projectInfo.project.schemes[0]

    if (device.isSimulator) {
      _buildOnSimulator({scheme, device, xcodeProject, options, resolve, reject, rootPath})
    } else {
      _buildOnRealDevice({scheme, device, xcodeProject, options, resolve, reject, rootPath})
    }
  })
}

/**
 * build the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function _buildOnSimulator({scheme, device, rootPath,xcodeProject, options, resolve, reject}) {
  console.log('project is building ...')
  let buildInfo = ''
  try {
    let config=require(path.join(rootPath,'ios.config.json'));
    fs.writeFileSync(path.join(process.cwd(), 'bundlejs/index.js'), fs.readFileSync(path.join(process.cwd(), '../../dist', config.WeexBundle.replace(/\.(we|vue)$/, '.js'))));

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
function _buildOnRealDevice({scheme, device, xcodeProject, options, resolve, reject,rootPath}) {
  // @TODO support debug on real device
  let iOSConfig = new Config(iOSConfigResolver, path.join(rootPath, 'ios.config.json'))
  iOSConfig.getConfig().then((config) => {
    try {
      iOSConfigResolver.resolve(config);
      fs.writeFileSync(path.join(process.cwd(), 'bundlejs/index.js'), fs.readFileSync(path.join(process.cwd(), '../../dist', config.WeexBundle.replace(/\.we$/, '.js'))));
      resolve({device, xcodeProject, options, rootPath});
    }
    catch (e) {
      console.log(e);
    }

  }, (e)=>reject(e))

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
  console.log(simctlInfo)
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
  console.log('Success!')
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
  // simList = info['iOS ' + device.version]
  for (const key in info) {
    if (key.indexOf('iOS') > -1) {
      simList = info[key];
      for (const sim of simList) {
        if (sim.udid === device.udid) {
          return sim.availability === '(available)'
        }
      }
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
  const deviceId = device.udid
  try {
    if (!fs.existsSync(appPath)) {
      console.log('building...');
      child_process.execSync(path.join(__dirname, '../build/lib/cocoapods-build') + ' . Debug', {encoding: 'utf8'})

    }

    console.log(child_process.execSync(`../../node_modules/.bin/ios-deploy --justlaunch --debug --id ${deviceId} --bundle ${path.resolve(appPath)}`, {encoding: 'utf8'}))
  } catch (e) {
    reject(e)
  }
  console.log('Success!')
  // reject('Weex-Pack don\'t support run on real device. see you next version!')
}


module.exports = runIOS
