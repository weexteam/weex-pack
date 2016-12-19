/**
 * Created by godsong on 16/11/29.
 */
const PluginInfo = require('cordova-common').PluginInfo;
const Chalk = require('chalk');
const Npm = require('../utils/npm');
const Fs = require('fs');
const Market = require('./market');
module.exports = function (ali) {
  let plugin;
  try {
    plugin = new PluginInfo('./');
  } catch (e) {
    console.log();
    console.log(Chalk.red('  weex plugin project not found !'));
    console.log();
    console.log(`  You should run ${Chalk.blue('weexpack plugin create')} first`);
    console.log();
    process.exit();
  }
  var packageJSON = require('../../package.json');
  var package = {};
  package.name = Npm.prefix + plugin.id;
  package.version = plugin.version;
  package.platform = plugin.getPlatformsArray();
  package.description = plugin.description;
  package.keywords = plugin.keywords;
  package.license = plugin.license;
  package.description = plugin.description;
  if (ali) {
    package.publishConfig = {
      registry: 'http://registry.npm.alibaba-inc.com'
    }
  }
  if (package.version > packageJSON.version) {
    Fs.writeFileSync('./package.json', JSON.stringify(package, null, 4));
    Npm.publish(ali, true).then(function (success) {
      if (success) {
        Market.publish(package.name, package.version);
      }

    })
  }
  else {
    Market.publish(package.name, package.version);
  }

};
