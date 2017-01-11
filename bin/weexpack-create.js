#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const create = require('../src/create/create');
const cli = require('../src/cli');
const publish = require('../src/publish/publish');

program.usage('[project-name] [options]').on('--help', () => {
  console.log('  Examples:\n');
  console.log(chalk.grey('    # create a standard weex project'));
  console.log('    $ ' + chalk.blue('weexpack create myProject'));
  console.log();
}).parse(process.argv)



let args=[];
process.argv.forEach(function(arg,i){
  if(arg!='[object Object]') {//fix commander’s bug
    args.push(arg);
    if (i == 1) {
      args.push('create');
    }
  }
});

const projectName = args[3]

if (!projectName || !projectName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
  var msg = chalk.red('Invalid project name: ') + chalk.yellow(projectName);
  console.log(msg);
  process.exit();
}

cli(args);


if (program.args.length < 1) {
  program.help();
  process.exit();
}