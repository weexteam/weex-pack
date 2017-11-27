#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const create = require('../build/create/create');
const cli = require('../build/cli');
const publish = require('../build/publish/publish');
program
    .command('add [platform-name]')
    .option('-d, --d', 'debug')
    .option('-a, --ali', 'add ios platform only used in alibaba group')
    .description('add a new platform project')
    .action(function (pluginName, options) {


      let args=[];
      process.argv.forEach(function(arg,i){
        if(arg!='[object Object]') {//fix commander’s bug
          args.push(arg);
          if (i == 1) {
            args.push('platform');
          }
        }
      });
       cli(args);
    });

program
    .command('remove [platform-name]')
    .description('remove a platform project')
    .option('-d, --d', 'debug')
    .action(function (pluginName) {
      let args=[];
      process.argv.forEach(function(arg,i){
        if(arg!='[object Object]') {//fix commander’s bug
          args.push(arg);
          if (i == 1) {
            args.push('platform');
          }
        }
      });
      cli(args);
    });

program
    .command('list [options]')
    .description('all installed platform project')
    .action(function (pluginName) {
      let args=[];
      process.argv.forEach(function(arg,i){
        if(arg!='[object Object]') {//fix commander’s bug
          args.push(arg);
          if (i == 1) {
            args.push('platform');
          }
        }
      });
      cli(args);
    });




program.parse(process.argv);
