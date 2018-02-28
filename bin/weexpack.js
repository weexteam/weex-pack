#!/usr/bin/env node

const program = require('commander')
const utils = require('../lib/utils')
const logger = utils.logger;
const LOGLEVELS = utils.LOGLEVELS;
const binname = 'weex';

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});

// rename the cmdname for weex-toolkit
program._name = binname;

program
  .version(require('../package').version)
  .usage('<command> [options]')
  .command('create [name]', 'initialize a standard weex project')
  .command('platform [command]', 'command for add or remove a  platform project')
  .command('run [platform]', 'run weex app on the specific platform')
  .command('build [platform]', 'build weex app generator package(apk or ipa)')
  .command('plugin [command]', 'command for add,create,login,publish weex plugins')
  .option('--verbose', 'display all logs of debugger server')
  .option('--loglevel [loglevel]', 'set log level silent|error|warn|info|log|debug', 'error')
  .option('--telemetry', 'upload usage data to help us improve the toolkit')
  .parse(process.argv)


if (program.args.length < 1) {
  program.help();
  process.exit();
}

if (program.loglevel) {
  program.loglevel = program.loglevel.toLowercase && program.loglevel.toLowercase()
  if(LOGLEVELS.indexOf(program.loglevel) > -1) {
    logger.setLevel(program.loglevel)
  }
}

if (program.verbose) {
  logger.setLevel('verbose')
}

if(program.args.length >= 1){
  let isSupport = false;
  const list = ["create", "platform","run", "build", "plugin", "weexplugin","market"]

  if (list.indexOf(program.args[0]) > -1) {
    isSupport = true;
  }
  if(!isSupport){
    console.log("  error: unknown command '"+ program.args[0]+ "'")
    process.exit();
  }
}



