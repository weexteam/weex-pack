/** build the web apps
 * this is a command for weexpack building
 **/
const path = require('path');
const fs = require('fs');
const utils = require('../utils');

let pluginArr = [];
const rootPath = process.cwd();
const isVueProject = !fs.existsSync(path.join(rootPath, 'web/js/init.js'));
function buildWeb() {
  buildPlugin().then((code) => {
    buildSinglePlugin(code);  
  }).catch((err) => {
    console.log(err);
  });
}

function buildPlugin() {
  if (!fs.existsSync(path.join(rootPath, 'plugins/fetch.json'))) {
    return new Promise((resolve) => {
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
    // old weexpack folder
    if (!isVueProject) {
      js_template.push(`window.weex && window.weex.install(${pluginEle});`);   
    } else {
      js_template.push(`Vue.use(${pluginEle});`);
    }
    
  });
  let jsFileContents = js_template.join('\r\n');
  
  return new Promise((resolve, reject) => {
    if(isVueProject) {
      jsFileContents = jsFileContents;
    }  
    const jsTarget = isVueProject? './web/plugin.js' : './plugins/plugin_bundle.js';
    console.log(jsTarget);
    return fs.writeFile(path.join(rootPath, jsTarget), jsFileContents, function (err) {
      if (err) {
        return reject(err);
      }
      else {
        resolve('done');
      }
    });
  });
}



// build single plugin use webpack
function buildSinglePlugin(code) {
  if(code == 'no plugin build' || isVueProject) {
    try { 
      buildSource(); 
    }catch(e) {
      console.error(e);
    }
    return;
  }
  try {
    utils.buildJS('build_plugin').then(() => {
      buildSource();
      if (pluginArr.length > 0) {
        fs.unlink(path.join(rootPath, './plugins/plugin_bundle.js'));
      }
    });
  }
  catch (e) {
    console.error(e);
  }
}

// exec local webppack
function buildSource() {
  utils.exec('npm run build').then(() => {
    const tempBuildPath = path.join(rootPath, 'temp');
    if (fs.existsSync(tempBuildPath)) {
      // utils.deleteFolderRecursive(tempBuildPath);  
    }
  });
}


module.exports = buildWeb;
