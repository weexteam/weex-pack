const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const startJSServer = require('./server');
const util = require('../utils');
/**
 * Start web service
 * @param {Object} options
 */
function runWeb(options) {
  if (!checkWebEnv(process.cwd())) {
    console.log();
    console.log(chalk.red('  Not available web environment !'));
    console.log();
    console.log(`  You should run ${chalk.blue('weex create')} first`);
    return;
  }
  console.log();
  console.log(` => ${chalk.blue.bold('Starting web service')}`);
  startJSServer();
}
/**
 * Check web environment
 * @param {Strng} cwd
 */
function checkWebEnv(cwd) {
  return fs.existsSync(path.join(cwd, 'package.json')) && fs.existsSync(path.join(cwd, 'web'));
}
module.exports = runWeb;
