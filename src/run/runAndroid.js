const chalk = require('chalk')
const utils = require('../utils')

/**
 * Starts Android app on a connected emulator or device
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
}

module.exports = runAndroid
