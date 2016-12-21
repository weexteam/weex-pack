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
  var weexpackCache;
  if(Fs.existsSync('./.weexpack.cache')){
    weexpackCache=JSON.parse(Fs.readFileSync('./.weexpack.cache').toString());
  }
  else{
    weexpackCache={latest:'0.0.0'};
  }
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
  if (package.version > weexpackCache.latest) {
    Fs.writeFileSync('./package.json', JSON.stringify(package, null, 4));
    Npm.publish(ali, true).then(function (success) {
      if (success) {
        weexpackCache.latest=package.version;
        Market.publish(package.name, package.version);
        Fs.writeFileSync('./.weexpack.cache',JSON.stringify(weexpackCache,null,4));

      }

    })
  }
  else {
    Market.publish(package.name, package.version);
  }

};
