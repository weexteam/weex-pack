#!/usr/bin/env node

const program = require('commander');
const utils = require('../src/utils')
const logger = utils.logger;
const exit = require('exit');

const {
  install,
  uninstall,
  installForNewPlatform,
  create
} = require('../src/plugin');

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});

program
.command('create [plugin_name]')
.description('create a empty plugin project')
.action(function (pluginName) {
  if (pluginName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
    create(pluginName, program.argv)
  } else {
    logger.error(`Invalid plugin name:')} ${chalk.yellow(pluginName)}`);
    exit();
  }
});

program
  .command('add [plugin_name]')
  .description('Add a plugin into you project')
  .action(function (pluginName) {
    return install(pluginName, program.argv);
  });


program
  .command('remove [plugin_name]')
  .description('Remove a plugin into you project')
  .action(function (pluginName) {
    return uninstall(pluginName, program.argv);
  });

program
  .command('install [platformName]')
  .description('Install plugins into you project')
  .action(function (platformName) {
    if (platformName) {
      return installForNewPlatform(platformName)
    }
    return installForNewPlatform(['web', 'ios', 'android']);
  });

program.parse(process.argv);
