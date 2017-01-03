/** build the web apps
 * this is a command for weexpack building
 **/
const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');
const utils = require('../utils')
const runWeb = require('../run/web');

function buildWeb(options) {
  if(checkOldTemplate()) {
   // return ;
  }
  runWeb();
  
}

// if use old weexpack please remove some directoies to /platforms 
function checkOldTemplate() {
  if (fs.existsSync(path.join('./', 'web'))) {
    console.log(chalk.red('please remove "web" directory into "platforms"'));
    console.log('(new version weexpack not support old directoies)');
    return true;
  }
  return false;
}
module.exports = buildWeb;