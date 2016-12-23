/**
 * Created by godsong on 16/11/29.
 */
const PluginInfo = require('cordova-common').PluginInfo;
const Chalk = require('chalk');
const Npm = require('../utils/npm');
const Fs = require('fs');
const Market = require('./market');
const Cache = require('../utils/cache');
module.exports = function (ali) {
  let plugin;
  try {
    plugin = new PluginInfo('./');
  } catch (e) {
    if (e.message.indexOf('Cannot find plugin.xml for plugin') != -1) {
      console.log();
      console.log(Chalk.red('  weex plugin project not found !'));
      console.log();
      console.log(`  You should run ${Chalk.blue('weexpack plugin create')} first`);
      console.log();
      process.exit();
    }
    else {
      console.log();
      console.log(Chalk.red(e.message));
      console.log();
    }
  }
  Cache.init();

  if (plugin.version > Cache.get('latestVersion', '0.0.0')) {
    var package = {};
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
    let namespace = Cache.get('namespace');
    if (!namespace) {
      Market.apply(plugin.id, ali).then(function (result) {
        Cache.cache.namespace = result.namespace;
        package.name = result.fullname;
        _doPublish(package,plugin.id,result.namespace,ali)
      },function(){

      });
    }
    else {
      package.name = namespace + '-' + plugin.id;
      _doPublish(package, plugin.id,namespace,ali)
    }

  }
  else if(Cache.get('namespace')){
    Market.publish(plugin.id, Cache.get('namespace'),ali,plugin.version).then(function(){

    });
  }

};
function _doPublish(package, name,namespace,ali) {
  Fs.writeFileSync('./package.json', JSON.stringify(package, null, 4));
  Npm.publish(ali, true).then(function (success) {
    if (success) {
      Market.publish(name,namespace,ali,package.version);
      Cache.cache.latestVersion = package.version;
      Cache.save();
    }
  })
}
