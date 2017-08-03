/**
 * Created by godsong on 16/11/29.
 */
const PluginInfo = require('weexpack-common').PluginInfo;
const Chalk = require('chalk');
const Npm = require('../utils/npm');
const Fs = require('fs');
const Market = require('./market');
const Cache = require('../utils/cache');
const Path = require('path');
const login = require('./login');
module.exports = function (ali,typeid) {

  login.getToken();
  var dir = process.cwd();
  var xmlFilePath = Path.join(dir, 'plugin.xml');
  Cache.init();
  if (!Fs.existsSync(xmlFilePath)) {
    //新版本
    var pkg = require(Path.join(dir,"./package.json"))
    pkg.weexpack = "0.4.0"
    if (ali) {
      pkg.publishConfig = {
        registry: 'http://registry.npm.alibaba-inc.com'
      }
    }
    _doPublish(pkg, pkg.name, '', pkg.name, ali, [], pkg)
    return;
  }
  
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

  if (plugin.version > Cache.get('latestVersion', '0.0.0')) {
    let deps = plugin.getDependencies()
    if (deps.length > 0) {
      Promise.all(deps.map(d=>Market.info(d.id))).then(function (data) {

        deps = data.map((info)=> {
          return {name: info.name, fullname: info.fullname}
        });
        Cache.deps = deps;
        _publish(plugin, deps, ali)
      })
    }
    else {
      _publish(plugin, [], ali)
    }


  }
  else if (Cache.get('nameInfo')) {
    let nameInfo = Cache.get('nameInfo');
    Market.publish(plugin.id, nameInfo.namespace || '', nameInfo.fullname, ali, plugin.version).then(function () {

    });
  }
};
function _publish(plugin, deps, ali) {

  var package = {};
  package.version = plugin.version;
  package.platform = plugin.getPlatformsArray();
  package.description = plugin.description;
  package.keywords = plugin.keywords;
  package.license = plugin.license;
  package.description = plugin.description;
  let jsPkgJson;
  try {
    jsPkgJson = JSON.parse(Fs.readFileSync('./js/package.json').toString());
  } catch (e) {
    jsPkgJson = {}
  }
  if (jsPkgJson.main) {
    package.main = Path.join('./js', jsPkgJson.main);
  }
  let dependencies = jsPkgJson.dependencies || {};
  if (deps.length > 0) {
    deps = deps.filter((d)=> {
      dependencies[d.fullname] = '*';
      return d.fullname !== d.name;
    });

  }
  if (Object.keys(dependencies).length > 0) {
    package.dependencies = dependencies
  }
  if (ali) {
    package.publishConfig = {
      registry: 'http://registry.npm.alibaba-inc.com'
    }
  }
  let nameInfo = Cache.get('nameInfo');
  if (!nameInfo) {
    Market.apply(plugin.id, ali).then(function (result) {
      Cache.cache.nameInfo = result;
      package.name = result.fullname;
      _doPublish(package, plugin.id, result.namespace || '', result.fullname, ali, deps)
    }, function () {

    });
  }
  else {
    package.name = nameInfo.fullname;
    _doPublish(package, nameInfo.name, nameInfo.namespace || '', nameInfo.fullname, ali, deps)
  }


}


function _doPublish(package, name, namespace, fullname, ali, deps,extend) {

  if (deps.length > 0) {
    package.scripts = {
      'postinstall': 'node ./weexpack-hook.js'
    };
    let source = Fs.readFileSync(Path.join(__dirname, 'weexpack-hook.js')).toString();
    let code = 'var deps=' + JSON.stringify(deps) + ';\n';
    if (name !== fullname) {
      code += 'var self=' + JSON.stringify({name, fullname}) + ';\n';
    }
    Fs.writeFileSync('./weexpack-hook.js', code + source)
  }
  Fs.writeFileSync('./package.json', JSON.stringify(package, null, 4));
  Npm.publish(ali, true).then(function (success) {
    if (success) {
      console.log(name,namespace,fullname,ali,package.version,extend)
      Market.publish(name, namespace, fullname, ali, package.version, extend);
      Cache.cache.latestVersion = package.version;
      Cache.save();
    }

  }, function () {
  })
}
function removePackageJson() {
  try {
    Fs.unlink('./package.json', function () {
    });
  } catch (e) {
  }
}
