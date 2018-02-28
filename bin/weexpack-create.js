#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const rm = require('rimraf').sync;
const home = require('user-home')
const fs = require('fs');
const tildify = require('tildify')
const path = require('path');
const create = require('../lib/create');
const utils = require('../lib/utils')
const logger = utils.logger;
const events = utils.events;
const binname = 'weex';

process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});

// For WeexpackError print only the message without stack trace unless we
// are in a verbose mode.
logger.subscribe(events);

// rename the cmdname for weex-toolkit
program._name = `${binname} create`;

program
.option('--offline', 'use cached template')
.option('--clone', 'use git clone')
.option('--telemetry', 'upload usage data to help us improve the toolkit')
.usage('<template-name> [project-name]')

program.on('--help', () => {
  console.log()
  console.log('  Examples:');
  console.log()
  console.log(chalk.bold('    # create a new project with an official template'));
  console.log('    $ ' + chalk.yellow(`${binname} create my-project`));
  console.log()
  console.log(chalk.bold('    # create a new project straight from a github template'));
  console.log('    $ ' + chalk.yellow(`${binname} create username/repo my-project`));
  console.log();
})

/**
 * Help.
 */
const help = () => {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}
help()

let template;
let rawName;
if (program.args.length > 1) {
  template = program.args[0]
  rawName = program.args[1]
}
else {
  template = 'webpack';
  rawName = program.args[0]
}

const target = path.resolve(rawName);
const hasSlash = template.indexOf('/') > -1
const options = {};


if (!hasSlash) {
  // use official templates
  template = 'weex-templates/' + template
}
const tmp = path.join(home, '.weex-templates', template.replace(/\//g, '-'))
if (program.offline) {
  console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`)
  template = tmp
}
if (program.clone) {
  options['clone'] = true;
}

if (!rawName || !rawName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
  const msg = chalk.red('Invalid project name: ') + chalk.yellow(rawName);
  logger.error(msg)
  process.exit();
}

if (program.args.length < 1) {
  program.help();
  process.exit();
}

if (fs.existsSync(target)) {
  inquirer.prompt([{
    type: 'confirm',
    message: 'Target directory exists. Continue?',
    name: 'ok'
  }]).then(answers => {
    if (answers.ok) {
      create(target, rawName, template, events, options);
    }
  }).catch(logger.error)
} else {
  create(target, rawName, template, events, options);
}
process.on('uncaughtException', (err) => {
  logger.error(err.stack)
});
process.on('unhandledRejection', (err) => {
  logger.error(err.stack);
});
