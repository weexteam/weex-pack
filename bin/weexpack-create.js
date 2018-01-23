#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const rm = require('rimraf').sync;
const fs = require('fs');
const path = require('path');
const create = require('../src/create');
const utils = require('../src/utils')
const logger = utils.logger;
const events = utils.events;

// For WeexpackError print only the message without stack trace unless we
// are in a verbose mode.
logger.subscribe(events);

program.usage('[project-name] [options]').on('--help', () => {
  console.log('  Examples:\n');
  console.log(chalk.grey('    # create a standard weex project'));
  console.log('    $ ' + chalk.blue('weex create myProject'));
  console.log();
}).parse(process.argv)

const rawName = program.args[0]
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
      create(rawName,'',rawName, {}, events);
    }
  }).catch(logger.error)
} else {
  create(rawName,'',rawName, {}, events);
}

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});
