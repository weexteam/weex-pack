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

function buildWeb(options) {
    /*if (checkOldTemplate()) {
        // return ;
    }*/
    buildPlugin()
}

// if use old weexpack please move some directoies to /platforms 
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
        return;
    }
    // check plugin history
    let plugins = require(path.join(rootPath, 'plugins/fetch.json'));
    for (let k in plugins) {
        pluginArr.push(k);
    }
    let result = Promise.resolve();
    pluginArr.forEach((plugin) => {
        result = result.then(() => {
            return fs.writeFile(path.join(rootPath, './plugins/' + plugin + '.js'), 'require("' + plugin + '")', function (err) {})
        });
    });
    return result.then(() => {
        buildSinglePlugin();
    }).catch((err) => {
        console.log(err);
    })
}

// build single plugin use webpack
function buildSinglePlugin() {
    
    try {
        utils.buildJS('build_plugin').then(() => {
            utils.exec('npm run build',true)
        });
    }
    catch (e) {
        console.error(e);
    }
}
module.exports = buildWeb;