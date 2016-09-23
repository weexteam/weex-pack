const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const utils = require('../utils')
const inquirer = require('inquirer')

/**
 * Run iOS app
 * @param {Object} options
 */
function runIOS(options) {
  prepareIOS({options})
    .then(installDep)
    .then(findIOSDevice)
    .then(chooseDevice)
    .then(buildApp)
    .then(runApp)
    .catch((e) => {
      console.log(e)
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
    process.chdir(path.join(rootPath, 'ios'))

    const xcodeProject = utils.findXcodeProject(process.cwd())

    if (xcodeProject) {
      console.log()
      console.log(` => ${chalk.blue.bold('Will start iOS app')}`)
      resolve({xcodeProject, options})
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
function installDep({xcodeProject, options}) {
  return new Promise((resolve, reject) => {
    resolve({xcodeProject, options})
    console.log(` => ${chalk.blue.bold('pod install')}`)
    try {
      child_process.execSync('pod install', {encoding: 'utf8'})
    } catch(e) {
      reject(e)
    }
    resolve(xcodeProject, options)
  })
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
 * @return {String} deviceId
 */
function chooseDevice({devicesList, xcodeProject, options}) {
  return new Promise((resolve, reject) => {
    if (devicesList) {
      const listNames = [new inquirer.Separator(' = Real devices = ')]
      for (const device of devicesList) {
        listNames.unshift(
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
 */
function _buildOnSimulator({scheme, device, xcodeProject, options, resolve, reject}) {
  console.log('project is building ...')
  let buildInfo = ''
  try {
    buildInfo = child_process.execSync(`xcodebuild -${xcodeProject.isWorkspace ? 'workspace' : 'project'} ${xcodeProject.name} -scheme ${scheme} -configuration Debug -destination id=${device.udid} -sdk iphonesimulator -derivedDataPath build clean build`, {encoding: 'utf8'})
  } catch (e) {
    reject(e)
  }
  // console.log(buildInfo)
  resolve({device, xcodeProject, options})
}

/**
 * build the iOS app on real device
 */
function _buildOnRealDevice({scheme, device, xcodeProject, options, resolve, reject}) {
  // @TODO support debug on real device
  reject('Weex-Pack don\'t support debug on real device. see you next version!')
}

/**
 * Run the iOS app on simulator or device
 * @param {String} device
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
 * @param {String} device
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
 * @param {String} device
 * @param {Object} xcode project
 * @param {Object} options
 */
function _runAppOnDevice({device, xcodeProject, options, resolve, reject}) {
  // @TODO support run on real device
  reject('Weex-Pack don\'t support run on real device. see you next version!')
}


module.exports = runIOS
