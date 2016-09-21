const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

/**
 * Start web service
 * @param {Object} options
 */
function runWeb(options) {
  if (!checkWebEnv(process.cwd())) {
    console.log()
    console.log(chalk.red('  Not available web environment !'))
    console.log()
    console.log(`  You should run ${chalk.blue('weexpack init')} first`)
    return
  }

  console.log()
  console.log(` => ${chalk.blue.bold('Starting web service')}`)

  install()
  startServer()
}

/**
 * Check web environment
 * @param {Strng} cwd
 */
function checkWebEnv(cwd) {
  return fs.existsSync(path.join(cwd, 'package.json'))
      && fs.existsSync(path.join(cwd, 'web'))
}

/**
 * Install npm dependencies
 */
function install() {
}

/**
 * Start a web server
 */
function startServer() {
}

module.exports = runWeb
