#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const platform = require('../lib/platform');
const utils = require('../lib/utils')
const logger = utils.logger;

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
// .option('--telemetry', 'upload usage data to help us improve the toolkit')
.description('all installed platform project')
.action((pluginName, options) => {
  platform('list', pluginName, options);
});

program.parse(process.argv);
