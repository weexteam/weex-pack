const chalk = require('chalk')
const utils = require('../utils')
const adb = require('./adb')

/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
function runAndroid(options) {
  if (!utils.checkAndroid(process.cwd())) {
    console.log()
    console.log(chalk.red('  Android project not found !'))
    console.log()
    console.log(`  You should run ${chalk.blue('weexpack init')} first`)
    return
  }

  console.log()
  console.log(` => ${chalk.blue.bold('Will start Android app')}`)

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
}

/**
 * Run the Android app on emulator or device
 * @param {Object} options
 */
function runApp(options) {
}

module.exports = runAndroid
