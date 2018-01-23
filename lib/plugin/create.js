'use strict';

var yeoman = require('yeoman-environment');

/**
 * Initialize a standard weex project
 * @param {String} project name
 * @param {String} config file path
 */
function init(projectName, configFile) {
  var env = yeoman.createEnv();

  env.register(require.resolve('generator-weex-plugin'), 'weex:plugin');

  // TODO: get generator configs from configFile
  var args = [projectName];

  var generator = env.create('weex:plugin', {
    args: args
  });

  generator.run();
}

module.exports = init;