'use strict';

/** build the web apps
 * this is a command for weexpack building
 **/
var utils = require('../utils');

var buildWeb = function buildWeb() {
  return buildSinglePlugin();
};

// build single plugin use webpack
var buildSinglePlugin = function buildSinglePlugin() {
  try {
    utils.buildJS('build:plugin').then(function () {
      utils.exec('npm run pack:web', true);
    });
  } catch (e) {
    console.error(e);
  }
};
module.exports = buildWeb;