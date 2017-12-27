#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const create = require('../src/create/create');
const cli = require('../src/cli');
const parseArgs = function () {
  let args = [];
  process.argv.forEach(function (arg, i) {
    if (arg != '[object Object]') { //fix commander’s bug
      args.push(arg);
      if (i == 1) {
        args.push('platform');
      }
    }
  });
  return args;
}
program.command('add [platform-name]').description('add a new platform project').action(function (pluginName, options) {
  const args = parseArgs();
  cli(args);
});
program.command('remove [platform-name]').description('remove a platform project').action(function (pluginName) {
  const args = parseArgs();
  cli(args);
});
program.command('list [options]').description('all installed platform project').action(function (pluginName) {
  const args = parseArgs();
  cli(args);
});
program.parse(process.argv);
