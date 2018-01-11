const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const server = require('./server');

const logger = require('weexpack-common').CordovaLogger.get();

/**
 * Start web service
 * @param {Object} options
 */
function runWeb (options) {
  if (!checkWebEnv(process.cwd())) {
    logger.info(chalk.red('\n  Not available web environment !'));
    logger.info(`\n  You should run ${chalk.blue('weex create')} first`);
    return;
  }
  logger.info(`\n=> ${chalk.blue.bold('Starting web service')}\n`);
  server.startJSServer();
}
/**
 * Check web environment
 * @param {Strng} cwd
 */
function checkWebEnv (cwd) {
  return fs.existsSync(path.join(cwd, 'package.json')) && fs.existsSync(path.join(cwd, 'web'));
}
module.exports = runWeb;
