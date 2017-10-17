#!/usr/bin/env node
'use strict';

var program = require('commander');
var chalk = require('chalk');
var create = require('../build/create/create');
var cli = require('../build/cli');
var publish = require('../build/publish/publish');
var project = require('../build/plugin/project');
program.command('create [platform-type]').description('create a empty plugin container project').option('-a, --ali', 'add ios platform only used in alibaba group').action(function (platformName, options) {
  var projectRoot = process.env.PWD || process.cwd();
  if (platformName == "ios" || platformName == "android") {
    project.createProject(projectRoot, platformName, options);
  } else {
    console.log();
    console.log('  ' + chalk.red('Invalid platform type:') + ' ' + chalk.yellow(platformName));
    process.exit();
  }
});
program.parse(process.argv);