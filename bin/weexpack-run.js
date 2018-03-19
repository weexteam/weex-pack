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

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});

// rename the cmdname for weex-toolkit
program._name = `${binname} run`;

program
  .usage('<platform> [options]')
  .option('--config [path]', 'specify the configuration file')
  .option('--clean','clean project before build android app')
  .option('--telemetry', 'upload usage data to help us improve the toolkit')  
  .option('--iosBuildPath', 'set XCode Deviced Data path if you have been custome it')  

program.on('--help', () => {
  console.log()
  logger.log('Examples:')
  console.log()
  logger.log(chalk.bold('  # run weex Android project'))
  logger.log('  $ ' + chalk.yellow(`${binname} run android`))
  console.log()
  logger.log(chalk.bold('  # run weex iOS project'))
  logger.log('  $ ' + chalk.yellow(`${binname} run ios`))
  console.log()
  logger.log(chalk.bold('  # run weex web'))
  logger.log('  $ ' + chalk.yellow(`${binname} run web`))
})
/**
 * Help.
 */
const help = () => {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}

help()

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
