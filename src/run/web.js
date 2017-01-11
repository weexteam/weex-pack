const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')
const startJSServer = require('./server')
const util = require('../utils')
const opener = require('opener');
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

  util.buildJS().then(function () {
    let exist = startJSServer();
    //没办法无法预知服务器啥时候完成
    setTimeout(function () {
      preview()
    }, exist ? 0 : 2000)

  })

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
 * Preview in browser
 */
function preview() {
  console.log(` => ${chalk.green('server is running')}`)
  console.log(`    please open ${chalk.cyan('http://localhost:8080/web/index.html')}`)
  opener('http://localhost:8080/web/index.html');


  // open url in browser
  // try {
  //   child_process.execSync(`open http://localhost:8080/web/index.html`, {encoding: 'utf8'})
  // } catch(e) {}
}

module.exports = runWeb
