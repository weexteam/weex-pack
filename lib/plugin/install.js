'use strict';

var utils = require('../utils');
var npmHelper = require('../utils/npm');
var path = require('path');
var fs = require('fs');
var xcode = require('xcode');
var plist = require('plist');
var podfile = require('./podfile');
var merge = require('merge');
var chalk = require('chalk');
var ora = require('ora');
var _ = require('underscore');
var logger = utils.logger;

var CONFIGS = require('./config');

var pluginConfigs = CONFIGS.defaultConfig;

// should install npm package into project or not. default: false
var shouldInstallPackage = false;

// Get plugin config in project.
var pluginConfigPath = path.join(CONFIGS.rootPath, CONFIGS.filename);
if (fs.existsSync(pluginConfigPath)) {
  pluginConfigs = JSON.parse(fs.readFileSync(pluginConfigPath));
}

var androidPluginConfigs = [];

// Get plugin config in android project.
var androidPluginConfigPath = path.join(CONFIGS.androidPath, CONFIGS.androidConfigFilename);
if (fs.existsSync(androidPluginConfigPath)) {
  androidPluginConfigs = JSON.parse(fs.readFileSync(androidPluginConfigPath));
}

var installForWeb = function installForWeb(plugins) {
  if (_.isEmpty(plugins) && !_.isArray(plugins)) {
    return;
  }
  var packageJsonFile = path.join(CONFIGS.root, 'package.json');
  var packageJson = JSON.parse(fs.readFileSync(packageJsonFile));

  plugins.forEach(function (plugin) {
    packageJson['dependencies'][plugin.name] = plugin.version;
  });

  packageJson = utils.output.sortDependencies(packageJson);

  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');

  logger.info('Downloading plugins...');

  utils.installNpmPackage().then(function () {
    logger.info('Building plugins...');
    return utils.buildJS('build:plugin').then(function () {
      logger.info('Building plugins successful.');
    });
  });
};

var installForIOS = function installForIOS(plugins) {
  if (_.isEmpty(plugins) && !_.isArray(plugins)) {
    return;
  }
  plugins.forEach(function (plugin) {
    var buildPatch = podfile.makeBuildPatch(plugin.name, plugin.version);
    // Build Podfile config.
    podfile.applyPatch(path.join(CONFIGS.iosPath, 'Podfile'), buildPatch);
    logger.success(plugin.name + ' has installed success in iOS project');
  });
};

var installForAndroid = function installForAndroid(plugins) {
  if (_.isEmpty(plugins) && !_.isArray(plugins)) {
    return;
  }
  plugins.forEach(function (plugin) {
    // write .wx_config.json on `platform/android`
    androidPluginConfigs = utils.updateAndroidPluginConfigs(androidPluginConfigs, plugin.name, plugin);
    logger.success(plugin.name + ' has installed success in Android project');
  });
  utils.writeAndroidPluginFile(CONFIGS.androidPath, androidPluginConfigPath, androidPluginConfigs);
};

var installForNewPlatform = function installForNewPlatform(platforms) {
  var pluginsList = JSON.parse(fs.readFileSync(path.join(CONFIGS.rootPath, CONFIGS.filename)));
  if (platforms && !_.isArray(platforms)) {
    platforms = [platforms];
  }
  platforms.forEach(function (platform) {
    switch (platform) {
      case 'web':
        installForWeb(pluginsList[platform]);
        break;
      case 'ios':
        installForIOS(pluginsList[platform]);
        break;
      case 'android':
        installForAndroid(pluginsList[platform]);
        break;
      default:
        break;
    }
  });
};

var installNewPlugin = function installNewPlugin(dir, pluginName, version) {
  utils.isNewVersionPlugin(pluginName, version, function (result) {
    if (result) {
      handleInstall(dir, pluginName, version, result);
      if (shouldInstallPackage) {
        installInPackage(dir, pluginName, version, result);
      }
    } else {
      logger.warn('This package of weex is not support anymore! Please choose other package.');
    }
  });
};

var install = function install(pluginName, args) {
  var version = void 0;
  if (/@/ig.test(pluginName)) {
    var temp = pluginName.split('@');
    pluginName = temp[0];
    version = temp[1];
  }
  var dir = process.cwd();
  // get the lastest version
  if (!version) {
    npmHelper.getLastestVersion(pluginName, function (version) {
      installNewPlugin(dir, pluginName, version);
    });
  } else {
    installNewPlugin(dir, pluginName, version);
  }
};

var handleInstall = function handleInstall(dir, pluginName, version, option) {

  if (option.web) {
    // should install npm package into project or not.
    shouldInstallPackage = true;
  }

  // check out the type of current project
  if (utils.isIOSProject(dir)) {
    var project = utils.isIOSProject(dir);
    if (!fs.existsSync(path.join(dir, 'Podfile'))) {
      logger.error("can't find Podfile file");
      return;
    }
    var iosPackageName = option.ios && option.ios.name ? option.ios.name : pluginName;

    if (option.ios && option.ios.plist) {
      var projectPath = void 0;
      if (!project.isWorkspace) {
        projectPath = path.join(dir, project.name, 'project.pbxproj');
      }
      installPList(dir, projectPath, option.ios.plist || {});
    }

    if (option.ios) {
      var iosVersion = option.ios && option.ios.version || version;
      var buildPatch = podfile.makeBuildPatch(iosPackageName, iosVersion);
      // Build Podfile config.
      podfile.applyPatch(path.join(dir, 'Podfile'), buildPatch);
      logger.warn(pluginName + ' has installed success in iOS project.');
      logger.info('if you want to update it, please use `weex plugin update` command.');
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, iosPackageName, option, 'ios');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
    }
  } else if (utils.isAndroidProject(dir)) {
    var androidPackageName = option.android && option.android.name ? option.android.name : pluginName;
    if (option.android) {
      androidPluginConfigs = utils.updateAndroidPluginConfigs(androidPluginConfigs, androidPackageName, option.android);
      utils.writeAndroidPluginFile(CONFIGS.androidPath, androidPluginConfigPath, androidPluginConfigs);

      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, androidPackageName, option, 'android');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
      logger.warn(pluginName + ' has installed success in Android project.');
      logger.info('if you want to update it, please use `weex plugin update` command.');
    }
  } else if (utils.isCordova(dir)) {
    var platformList = utils.listPlatforms(dir);
    for (var i = 0; i < platformList.length; i++) {
      var platformDir = path.join(dir, 'platforms', platformList[i].toLowerCase());
      handleInstall(platformDir, pluginName, version, option);
    }
  } else {
    logger.info('The project may not be a weex project, please use `' + chalk.white.bold('weex create [projectname]') + '`');
  }
};

var installPList = function installPList(projectRoot, projectPath, config) {
  var xcodeproj = xcode.project(projectPath);
  xcodeproj.parseSync();
  var xcBuildConfiguration = xcodeproj.pbxXCBuildConfigurationSection();
  var plistFileEntry = void 0;
  var plistFile = void 0;
  for (var p in xcBuildConfiguration) {
    var entry = xcBuildConfiguration[p];
    if (entry.buildSettings && entry.buildSettings.INFOPLIST_FILE) {
      plistFileEntry = entry;
      break;
    }
  }
  if (plistFileEntry) {
    plistFile = path.join(projectRoot, plistFileEntry.buildSettings.INFOPLIST_FILE.replace(/^"(.*)"$/g, '$1').replace(/\\&/g, '&'));
  }

  if (!fs.existsSync(plistFile)) {
    logger.error('Could not find *-Info.plist file');
  } else {
    var obj = plist.parse(fs.readFileSync(plistFile, 'utf8'));
    obj = merge.recursive(true, obj, config);
    fs.writeFileSync(plistFile, plist.build(obj));
  }
};

var installInPackage = function installInPackage(dir, pluginName, version, option) {
  var p = path.join(dir, 'package.json');
  logger.info('Downloading plugin...');
  if (fs.existsSync(p)) {
    var pkg = require(p);
    pkg.dependencies[pluginName] = version;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
  }
  utils.installNpmPackage().then(function () {
    var browserPluginName = option.web && option.web.name ? option.web.name : pluginName;
    if (option.web) {
      logger.info('Update plugins.json...');
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, browserPluginName, option, 'web');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
      logger.info('Building plugins...');
      return utils.buildJS('build:plugin').then(function () {
        logger.success('Building plugins successful.');
      });
    }
  });
};

module.exports = {
  install: install,
  installForNewPlatform: installForNewPlatform
};