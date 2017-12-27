/** build the web apps
 * this is a command for weexpack building
 **/
const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');
const utils = require('../utils');
const pluginArr = [];

const buildWeb = () => buildSinglePlugin()

// build single plugin use webpack
const buildSinglePlugin = () => {
  try {
    utils.buildJS('build:plugin').then(() => {
      utils.exec('npm run pack:web', true);
    });
  }
  catch (e) {
    console.error(e);
  }
}
module.exports = buildWeb;
