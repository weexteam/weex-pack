#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const utils = require('../lib/utils')
const logger = utils.logger;
const binname = 'weex';

const {
  buildAndroid,
  buildIOS,
  buildWeb
} = require('../lib/build');

// rename the cmdname for weex-toolkit
program._name = `${binname} build`;

program
  .option('--telemetry', 'upload usage data to help us improve the toolkit')
  .usage('<platform> [options]')

program.on('--help', () => {
  console.log()
  logger.log('Examples:')
  console.log()
  logger.log(chalk.bold('  # build weex Android project'))
  logger.log('  $ ' + chalk.yellow(`${binname} build android`))
  console.log()
  logger.log(chalk.bold('  # build weex iOS project'))
  logger.log('  $ ' + chalk.yellow(`${binname} build ios`))
  console.log()
  logger.log(chalk.bold('  # build weex web'))
  logger.log('  $ ' + chalk.yellow(`${binname} build web`))
})

/**
 * Help.
 */
const help = () => {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}

help()

const isValidPlatform = (args) => {
  if (args && args.length) {
    return args[0] === 'android' || args[0] === 'ios' || args[0] === 'web'
  }
  return false
}

/**
 * Run weex app on the specific platform
 * @param {String} platform
 */
const build = (platform, options) => {
  switch (platform) {
    case 'android' : buildAndroid(options); break;
    case 'ios' : buildIOS(options); break;
    case 'web' : buildWeb(options); break;
  }
}

// check if platform exist
if (program.args.length < 1) {
  program.help()
  process.exit()
}

if (isValidPlatform(program.args)) {
  // TODO: parse config file
  build(program.args[0], {configPath:program.config,clean:program.clean})

} else {
  console.log()
  console.log(`  ${chalk.red('Unknown platform:')} ${chalk.yellow(program.args[0])}`)
  console.log()
  printExample()
  process.exit()
}
