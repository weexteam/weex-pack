#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const create = require('../build/create/create');
const cli = require('../build/cli');
const publish = require('../build/publish/publish');
var project = require('../build/plugin/project')
program
    .command('create [platform-type]')
    .description('create a empty plugin container project')
    .option('-a, --ali', 'add ios platform only used in alibaba group')
    .action(function (platformName, options) {
      var projectRoot =  process.env.PWD || process.cwd()
      if (platformName == "ios" || platformName == "android") {
        project.createProject(projectRoot, platformName, options)
      } else {
        console.log();
        console.log(`  ${chalk.red('Invalid platform type:')} ${chalk.yellow(platformName)}`);
        process.exit();
      }
    });
program.parse(process.argv);