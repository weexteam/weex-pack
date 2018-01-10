#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const cli = require('../src/cli');
const inquirer = require('inquirer');
const rm = require('rimraf').sync;
const fs = require('fs');
const path = require('path');
const logger = require('weexpack-common').CordovaLogger.get();

program.usage('[project-name] [options]').on('--help', () => {
  console.log('  Examples:\n');
  console.log(chalk.grey('    # create a standard weex project'));
  console.log('    $ ' + chalk.blue('weex create myProject'));
  console.log();
}).parse(process.argv)



// Setting

let args=[];

process.argv.forEach(function(arg,i){
  if(arg!='[object Object]') {//fix commander’s bug
    args.push(arg);
    if (i == 1) {
      args.push('create');
    }
  }
});

const rawName = args[3]
const to = path.resolve(rawName);

if (!rawName || !rawName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
  const msg = chalk.red('Invalid project name: ') + chalk.yellow(rawName);
  logger.error(msg)
  process.exit();
}

if (program.args.length < 1) {
  program.help();
  process.exit();
}

if (fs.existsSync(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Target directory exists. Continue?',
    name: 'ok'
  }]).then(answers => {
    if (answers.ok) {
      cli(args);
    }
  }).catch(logger.error)
} else {
  cli(args);
}

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});
