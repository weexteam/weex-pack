#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const platform = require('../src/platform');
const utils = require('../src/utils')
const logger = utils.logger;

program
.command('add [platform-name]')
.description('add a new platform project')
.action((pluginName, options) => {
  platform('add', pluginName, {});
});

program
.command('remove [platform-name]')
.description('remove a platform project')
.action((pluginName) => {
  platform('remove', pluginName);
});

program
.command('update [platform-name]')
.description('update a platform project')
.action((pluginName) => {
  platform('update', pluginName);
});

program
.command('list [options]')
.description('all installed platform project')
.action((options) => {
  platform('list', options);
});

program.parse(process.argv);
