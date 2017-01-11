const chalk = require('chalk')
const initProject = require('./src/init/init')
const runAndroid = require('./src/run/Android')
const runIOS = require('./src/run/iOS')
const runWeb = require('./src/run/web')

/**
 * Get current version
 */
function getVersion() {
  return require('./package.json').version
}

/**
 * Initialize a standard weex project
 * @param {String} project name
 * @param {String} config file path
 */
function init(projectName = '', configFile = '') {
  if (projectName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
    initProject(projectName, configFile)
  } else {
    console.log(`  ${chalk.red('Invalid project name:')} ${chalk.yellow(projectName)}`)
  }
}

/**
 * Run weex app on the specific platform
 * @param {String} platform
 */
function run(platform = '', options = {}) {
  switch (platform) {
    case 'android' : runAndroid(options); break;
    case 'ios'     : runIOS(options);     break;
    case 'web'     : runWeb(options);     break;

    default : {
      console.log(`  ${chalk.red('Unknown platform:')} ${chalk.yellow(platform)}`)
    }
  }
}

module.exports = {
  getVersion,
  init,
  run,
  runAndroid,
  runIOS,
  runWeb,
}
