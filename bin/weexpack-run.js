#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const utils = require('../lib/utils')
const logger = utils.logger;
const {
  runAndroid,
  runIOS,
  runWeb
} = require('../lib/run');
const binname = 'weex';

program
  .usage('<platform> [options]')
  .option('--config [path]', 'specify the configuration file')
  .option('--clean','clean project before build android app')
  .on('--help', printExample)
  .parse(process.argv)

function printExample() {
  logger.log('Examples:')
  logger.log(chalk.grey('  # run weex Android project'))
  logger.log('  $ ' + chalk.blue(`${binname} run android`))
  logger.log(chalk.grey('  # run weex iOS project'))
  logger.log('  $ ' + chalk.blue(`${binname} run ios`))
  logger.log(chalk.grey('  # run weex web'))
  logger.log('  $ ' + chalk.blue(`${binname} run web`))
}


function isValidPlatform(args) {
  if (args && args.length) {
    return args[0] === 'android' || args[0] === 'ios' || args[0] === 'web'
  }
  return false
}

/**
 * Run weex app on the specific platform
 * @param {String} platform
 */
function run(platform, options) {
  switch (platform) {
    case 'android' : runAndroid(options); break;
    case 'ios' : runIOS(options); break;
    case 'web' : runWeb(options); break;
  }
}

// check if platform exist
if (program.args.length < 1) {
  program.help()
  process.exit()
}

if (isValidPlatform(program.args)) {
  // TODO: parse config file
  run(program.args[0], {configPath:program.config,clean:program.clean})
} else {
  logger.error(`Unknown platform: ${chalk.yellow(program.args[0])}`)
  printExample()
  process.exit()
}
