const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const utils = require('../utils')

/**
 * Run iOS app
 * @param {Object} options
 */
function runIOS(options) {
  const rootPath = process.cwd()

  if (!utils.checkIOS(rootPath)) {
    console.log()
    console.log(chalk.red('  iOS project not found !'))
    console.log()
    console.log(`  You should run ${chalk.blue('weexpack init')} first`)
    return
  }

  // change working directory to ios
  process.chdir(path.join(rootPath, 'ios'))

  const xcodeProject = utils.findXcodeProject(process.cwd())

  if (xcodeProject) {
    console.log()
    console.log(` => ${chalk.blue.bold('Will start iOS app')}`)

  } else {
    console.log()
    console.log(`  ${chalk.red.bold('Could not find Xcode project files in ios folder')}`)
    console.log()
    console.log(`  Please make sure you have installed iOS Develop Environment and CocoaPods`)
    console.log(`  See ${chalk.cyan('http://alibaba.github.io/weex/doc/advanced/integrate-to-ios.html')}`)
  }
}

/**
 * Build the iOS app
 * @param {Object} xcode project
 * @param {Object} options
 */
function buildApp(xcodeProject, options) {
}

/**
 * Run the iOS app on emulator or device
 * @param {Object} xcode project
 * @param {Object} options
 */
function runApp(xcodeProject, options) {
}

module.exports = runIOS
