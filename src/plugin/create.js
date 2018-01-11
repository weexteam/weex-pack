const yeoman = require('yeoman-environment');

/**
 * Initialize a standard weex project
 * @param {String} project name
 * @param {String} config file path
 */
function init (projectName, configFile) {
  const env = yeoman.createEnv();

  env.register(require.resolve('generator-weex-plugin'), 'weex:plugin');

  // TODO: get generator configs from configFile
  const args = [projectName];

  const generator = env.create('weex:plugin', {
    args
  });

  generator.run();
}

module.exports = init;
