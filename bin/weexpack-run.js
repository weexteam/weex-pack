#!/usr/bin/env node
'use strict';

var program = require('commander');
var chalk = require('chalk');
var runAndroid = require('../build/run/Android');
var runIOS = require('../build/run/iOS');
var runWeb = require('../build/run/web');

program.usage('<platform> [options]').option('-c, --config [path]', 'specify the configuration file').option('-C, --clean', 'clean project before build android app').on('--help', printExample).parse(process.argv);

function printExample() {
  console.log('\n  Examples:');
  console.log();
  console.log(chalk.grey('    # run weex Android project'));
  console.log('    $ ' + chalk.blue('weexpack run android'));
  console.log();
  console.log(chalk.grey('    # run weex iOS project'));
  console.log('    $ ' + chalk.blue('weexpack run ios'));
  console.log();
  console.log(chalk.grey('    # run weex web'));
  console.log('    $ ' + chalk.blue('weexpack run web'));
  console.log();
}

function isValidPlatform(args) {
  if (args && args.length) {
    return args[0] === 'android' || args[0] === 'ios' || args[0] === 'web';
  }
  return false;
}

/**
 * Run weex app on the specific platform
 * @param {String} platform
 */
function run(platform, options) {
  switch (platform) {
    case 'android':
      runAndroid(options);break;
    case 'ios':
      runIOS(options);break;
    case 'web':
      runWeb(options);break;
  }
}

// check if platform exist
if (program.args.length < 1) {
  program.help();
  process.exit();
}

if (isValidPlatform(program.args)) {
  // TODO: parse config file
  run(program.args[0], { configPath: program.config, clean: program.clean });
} else {
  console.log();
  console.log(chalk.red('Unknown platform:') + ' ' + chalk.yellow(program.args[0]));
  console.log();
  printExample();
  process.exit();
}