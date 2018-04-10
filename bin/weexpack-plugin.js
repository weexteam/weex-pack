#!/usr/bin/env node

const program = require('commander');
const utils = require('../lib/utils')
const logger = utils.logger;
const exit = require('exit');
const chalk = require('chalk')
const binname = 'weex';

const {
  install,
  uninstall,
  installForNewPlatform,
  create
} = require('../lib/plugin');

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});

// rename the cmdname for weex-toolkit
program._name = `${binname} plugin`;

program
.command('create [plugin_name]')
.option('--telemetry', 'upload usage data to help us improve the toolkit')
.description('create a empty plugin project')
.action((pluginName, options) => {
  if (pluginName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
    create(pluginName, program.argv, options)
  } else {
    logger.error(`Invalid plugin name:')} ${chalk.yellow(pluginName)}`);
    exit();
  }
});

program
  .command('add [plugin_name]')
  .option('--telemetry', 'upload usage data to help us improve the toolkit')
  .description('Add a plugin into you project')
  .action((pluginName, options) => {
    return install(pluginName, program.argv, options);
  });


program
  .command('remove [plugin_name]')
  .option('--telemetry', 'upload usage data to help us improve the toolkit')
  .description('Remove a plugin into you project')
  .action((pluginName, options) => {
    return uninstall(pluginName, program.argv);
  });

program
  .command('install [platformName]')
  .option('--telemetry', 'upload usage data to help us improve the toolkit')
  .description('Install plugins into you project')
  .action((platformName, options) => {
    if (platformName) {
      return installForNewPlatform(platformName)
    }
    return installForNewPlatform(['web', 'ios', 'android']);
  });

program.on('--help', () => {
  logger.log('\nExamples:')
  logger.log(chalk.bold('\n  # add weex plugin'))
  logger.log('\n  $ ' + chalk.yellow(`${binname} plugin add [plugin-name]`))
  logger.log(chalk.bold('\n  # remove weex plugin'))
  logger.log('  $ ' + chalk.yellow(`${binname} plugin remove [plugin-name]`))
  logger.log(chalk.bold('\n  # install plugin for the platform'))
  logger.log('  $ ' + chalk.yellow(`${binname} plugin install [ios|android|web]`))
})

/**
 * Help.
 */
const help = () => {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}

help()