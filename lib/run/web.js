'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var server = require('./server');
var utils = require('../utils');
var logger = utils.logger;

/**
 * Start web service
 * @param {Object} options
 */
function runWeb(options) {
  if (!checkWebEnv(process.cwd())) {
    logger.error('Not available web environment!');
    logger.info('You should run ' + chalk.yellow('weex create') + ' first');
    return;
  }
  logger.info('Starting web service\n');
  server.startJSServer();
}
/**
 * Check web environment
 * @param {Strng} cwd
 */
function checkWebEnv(cwd) {
  return fs.existsSync(path.join(cwd, 'package.json')) && fs.existsSync(path.join(cwd, 'web'));
}
module.exports = runWeb;