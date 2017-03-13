/** build the web apps
 * this is a command for weexpack building
 **/
const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');
const utils = require('../utils')
let pluginArr = [];

function buildWeb() {
  /*if (checkOldTemplate()) {
   // return ;
   }*/
  buildPlugin().then((code) => {
    buildSinglePlugin(code);
  }).catch((err) => {
    console.log(err);
  });
}
// if using old weexpack please move some directoies to /platforms 
function checkOldTemplate() {
  if (fs.existsSync(path.join('./', 'web'))) {
    console.log(chalk.red('please remove "web" directory into "platforms"'));
    console.log('(new version weexpack not support old directoies)');
    return true;
  }
  return false;
}

function buildPlugin() {
  let rootPath = process.cwd();
  if (!fs.existsSync(path.join(rootPath, 'plugins/fetch.json'))) {
    return new Promise((resolve, reject) => {
      return resolve('no plugin build');
    });
  }
  // check plugin history
  let plugins = require(path.join(rootPath, 'plugins/fetch.json'));
  for (let k in plugins) {
    if (fs.existsSync(path.join(rootPath, 'plugins/' + k + '/web/package.json'))) {
      pluginArr.push(k);
    }
  }
  let js_template = [];
  pluginArr.forEach((plugin) => {
    let pluginEle = utils.dashToCamel(plugin.replace('weex-', ''));
    js_template.push('import ' + pluginEle + ' from "' + path.join(rootPath, 'plugins', plugin + '/web') + '";');
    js_template.push(`window.weex && window.weex.install(${pluginEle});`);
  });
  return new Promise((resolve, reject) => {
    return fs.writeFile(path.join(rootPath, './plugins/plugin_bundle.js'), js_template.join('\r\n'), function (err) {
      if (err) {
        return reject(err)
      }
      else {
        resolve('done')
      }
    })
  })
}
// build single plugin use webpack
function buildSinglePlugin(code) {
  if(code == 'no plugin build') {
    try {
      utils.exec('npm run build');
    }catch(e) {
      console.error(e);
    }
    return;
  }
  try {
    utils.buildJS('build_plugin').then(() => {
      utils.exec('npm run build', true);
      if (pluginArr.length > 0) {
        let rootPath = process.cwd();
        fs.unlink(path.join(rootPath, './plugins/plugin_bundle.js'));
      }
    });
  }
  catch (e) {
    console.error(e);
  }
}
module.exports = buildWeb;