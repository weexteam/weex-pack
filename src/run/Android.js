const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const utils = require('../utils')
const adb = require('./adb')

/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
function runAndroid(options) {
  const rootPath = process.cwd()

  if (!utils.checkAndroid(rootPath)) {
    console.log()
    console.log(chalk.red('  Android project not found !'))
    console.log()
    console.log(`  You should run ${chalk.blue('weexpack init')} first`)
    return
  }

  console.log()
  console.log(` => ${chalk.blue.bold('Will start Android app')}`)

  // change working directory to android
  process.chdir(path.join(rootPath, 'android'))

  startServer()
  buildApp(options)
  runApp(options)
}

/**
 * Start server in new window
 */
function startServer() {
}

/**
 * Build the Android app
 * @param {Object} options
 */
function buildApp(options) {
  try {
    const cmdFile = utils.isOnWindows()
      ? path.join(process.cwd(), './bin/gradlew.bat')
      : path.join(process.cwd(), './bin/gradlew')

    // TODO: setup gradle configs
    const gradleArgs = []

    // run gradle command file
    console.log(` => ${chalk.bold('Building the app on device')}`)
    child_process.execFileSync(cmdFile, gradleArgs, {
      stdio: [process.stdin, process.stdout, process.stderr],
    })
  } catch (e) {
    console.log()
    console.log(`    ${chalk.red.bold('Could not install the app on the device !')}`)
    console.log()
    console.log(`    Please make sure you have an Android emulator running or a device connected`)
    console.log(`    See ${chalk.cyan('http://alibaba.github.io/weex/doc/advanced/integrate-to-android.html')}`)
  }
}

/**
 * Run the Android app on emulator or device
 * @param {Object} options
 */
function runApp(options) {
}

module.exports = runAndroid
