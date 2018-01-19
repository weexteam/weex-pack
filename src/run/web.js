const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const server = require('./server');
const utils = require('../utils');
const logger = utils.logger;

/**
 * Start web service
 * @param {Object} options
 */
function runWeb (options) {
  if (!checkWebEnv(process.cwd())) {
    logger.error(`Not available web environment!`);
    logger.info(`You should run ${chalk.yellow('weex create')} first`);
    return;
  }
  logger.info(`Starting web service\n`);
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
