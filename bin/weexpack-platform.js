#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const platform = require('../lib/platform');
const utils = require('../lib/utils')
const logger = utils.logger;
const binname = 'weex';

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});

// rename the cmdname for weex-toolkit
program._name = `${binname} platform`;

program
.command('add [platform-name]')
.option('--telemetry', 'upload usage data to help us improve the toolkit')
.description('add a new platform project')
.action((pluginName, options) => {
  platform('add', pluginName, options);
});

program
.command('remove [platform-name]')
.option('--telemetry', 'upload usage data to help us improve the toolkit')
.description('remove a platform project')
.action((pluginName, options) => {
  platform('remove', pluginName, options);
});

program
.command('update [platform-name]')
.option('--telemetry', 'upload usage data to help us improve the toolkit')
.description('update a platform project')
.action((pluginName, options) => {
  platform('update', pluginName, options);
});

program
.command('list [options]')
.option('--telemetry', 'upload usage data to help us improve the toolkit')
.description('all installed platform project')
.action((pluginName, options) => {
  platform('list', pluginName, options);
});

program.on('--help', () => {
  console.log()
  logger.log('Examples:')
  console.log()
  logger.log(chalk.bold('  # add weex platform'))
  logger.log('  $ ' + chalk.yellow(`${binname} platform add [ios|android]`))
  console.log()
  logger.log(chalk.bold('  # remove weex platform'))
  logger.log('  $ ' + chalk.yellow(`${binname} platform remove [ios|android]`))
  console.log()
  logger.log(chalk.bold('  # update weex platform'))
  logger.log('  $ ' + chalk.yellow(`${binname} platform update [ios|android]`))
  console.log()
  logger.log(chalk.bold('  # list weex platform'))
  logger.log('  $ ' + chalk.yellow(`${binname} platform list`))
})

/**
 * Help.
 */
const help = () => {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}

help()
