const create = require('weexpack-create');
const path = require('path');
const fs = require('fs');
const rm = require('rimraf').sync;
const ora = require('ora');
const inquirer = require('inquirer');
const chalk = require('chalk');
const tildify = require('tildify');
const utils = require('../utils');
const home = require('user-home');
const events = utils.events;
const logger = utils.logger;

/**
 * Initialize a standard weex plugin project
 * @param {String} project name
 * @param {String} config file path
 */
module.exports = function (template, projectname, options) {
  if (!projectname) {
    projectname = template;
    template = 'weex-plugin-template';
  }

  const hasSlash = template.indexOf('/') > -1
  const target = path.resolve(projectname);

  if (!hasSlash) {
    // use official templates
    template = 'weex-templates/' + template
  }

  const tmp = path.join(home, '.weex-templates', template.replace(/\//g, '-'))

  if (fs.existsSync(tmp) && !options.update) {
    logger.log(`\n > You are Using the cached template at ${chalk.yellow(tildify(tmp))}, you can use \`--update\` option to update your template.\n`)
    template = tmp
  }

  if (fs.existsSync(target)) {
    inquirer.prompt([{
      type: 'confirm',
      message: 'Target directory exists. Continue?',
      name: 'ok'
    }]).then(answers => {
      if (answers.ok) {
        const spinner = ora(`Remove ${target} ...`).start();
        rm(target);
        spinner.stop();
        return create(target, projectname, template, events, options);
      }
    }).catch(logger.error)
  } else {
    return create(target, projectname, template, events, options);
  }
}

