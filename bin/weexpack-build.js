#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const buildAndroid = require('../src/build/Android');
const buildIOS = require('../src/build/iOS');
const buildWeb = require('../src/build/Web');

program
  .usage('<platform> [options]')
  .parse(process.argv);

function printExample() {
  console.log('  Examples:')
  console.log()
  console.log(chalk.grey('    # build weex Android project'))
  console.log('    $ ' + chalk.blue('weexpack build android'))
  console.log()
  console.log(chalk.grey('    # build weex iOS project'))
  console.log('    $ ' + chalk.blue('weexpack build ios'))
  console.log()
  console.log(chalk.grey('    # build weex web project'))
  console.log('    $ ' + chalk.blue('weexpack build web'))
  console.log()
}

program.on('--help', printExample)

function isValidPlatform(args) {
  if (args && args.length) {
    return args[0] === 'android' || args[0] === 'ios' || args[0] === 'web'
  }
  return false
}

/**
 * Run weex app on the specific platform
 * @param {String} platform
 */
function build(platform, options) {
  switch (platform) {
    case 'android' : buildAndroid(options); break;
    case 'ios' : buildIOS(options); break;
    case 'web' : buildWeb(options); break;
  }
}

// check if platform exist
if (program.args.length < 1) {
  program.help()
  process.exit()
}

if (isValidPlatform(program.args)) {
  // TODO: parse config file
  build(program.args[0], program.config)

} else {
  console.log()
  console.log(`  ${chalk.red('Unknown platform:')} ${chalk.yellow(program.args[0])}`)
  console.log()
  printExample()
  process.exit()
}
