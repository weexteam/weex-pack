#!/usr/bin/env node
'use strict';

var program = require('commander');
var chalk = require('chalk');
var create = require('../build/create/create');
var cli = require('../build/cli');
var publish = require('../build/publish/publish');
program.command('add [platform-name]').option('-d, --d', 'debug').option('-a, --ali', 'add ios platform only used in alibaba group').description('add a new platform project').action(function (pluginName, options) {

  var args = [];
  process.argv.forEach(function (arg, i) {
    if (arg != '[object Object]') {
      //fix commander’s bug
      args.push(arg);
      if (i == 1) {
        args.push('platform');
      }
    }
  });
  cli(args);
});

program.command('remove [platform-name]').description('remove a platform project').option('-d, --d', 'debug').action(function (pluginName) {
  var args = [];
  process.argv.forEach(function (arg, i) {
    if (arg != '[object Object]') {
      //fix commander’s bug
      args.push(arg);
      if (i == 1) {
        args.push('platform');
      }
    }
  });
  cli(args);
});

program.command('list [options]').description('all installed  platform project').action(function (pluginName) {
  var args = [];
  process.argv.forEach(function (arg, i) {
    if (arg != '[object Object]') {
      //fix commander’s bug
      args.push(arg);
      if (i == 1) {
        args.push('platform');
      }
    }
  });
  cli(args);
});

program.parse(process.argv);