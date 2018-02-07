'use strict';

var utils = require('../utils');
var npmHelper = require('../utils/npm');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');
var gradle = require('./gradle');
var podfile = require('./podfile');
var CONFIGS = require('./config');
var logger = utils.logger;

var pluginConfigs = CONFIGS.defaultConfig;

// should uninstall npm package into project or not. default: false
var shouldUninstallPackage = false;

// Get plugin config in project.
var pluginConfigPath = path.join(CONFIGS.rootPath, CONFIGS.filename);
if (fs.existsSync(pluginConfigPath)) {
  pluginConfigs = require(pluginConfigPath);
}

var handleUninstall = function handleUninstall(dir, pluginName, version, option) {

  if (option.web) {
    // should install npm package into project or not.
    shouldUninstallPackage = true;
  }

  // check out the type of current project
  if (utils.isIOSProject(dir)) {
    if (!fs.existsSync(path.join(dir, 'Podfile'))) {
      logger.error("can't find Podfile file");
      return;
    }
    var iosPackageName = option.ios && option.ios.name ? option.ios.name : pluginName;
    var iosVersion = option.ios && option.ios.version || version;
    var buildPatch = podfile.makeBuildPatch(iosPackageName, iosVersion);
    // Remove Podfile config.
    podfile.revokePatch(path.join(dir, 'Podfile'), buildPatch);
    logger.info(pluginName + ' has removed from iOS project');
    // Update plugin.json in the project.
    pluginConfigs = utils.updatePluginConfigs(pluginConfigs, iosPackageName, '', 'ios');
    utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
  } else if (utils.isAndroidProject(dir)) {
    var androidPackageName = option.android && option.android.name ? option.android.name : pluginName;
    var androidVersion = option.android && option.android.version || version;
    var _buildPatch = gradle.makeBuildPatch(androidPackageName, androidVersion, option.android.groupId || '');
    // Remove gradle config.
    gradle.revokePatch(path.join(dir, 'build.gradle'), _buildPatch);
    logger.info(pluginName + ' has removed from Android project');
    // Update plugin.json in the project.
    pluginConfigs = utils.updatePluginConfigs(pluginConfigs, androidPackageName, '', 'android');
    utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
  } else if (utils.isCordova(dir)) {
    var platformList = utils.listPlatforms(dir);
    for (var i = 0; i < platformList.length; i++) {
      handleUninstall(path.join(dir, 'platforms', platformList[i].toLowerCase()), pluginName, version, option);
    }
  } else if (fs.existsSync(path.join(dir, 'package.json'))) {
    uninstallInPackage(dir, pluginName, version);
  } else {
    logger.info('The project may not be a weex project, please use `' + chalk.white.bold('weex create [projectname]') + '`');
  }
};

var uninstallInPackage = function uninstallInPackage(dir, pluginName, version) {
  var packageJsonPath = path.join(dir, 'package.json');
  // Update package.json
  if (fs.existsSync(packageJsonPath)) {
    var packageJson = require(packageJsonPath);
    if (packageJson.dependencies[pluginName]) {
      delete packageJson.dependencies[pluginName];
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  logger.info('Update plugins.json...');
  // Update plugin.json in the project.
  pluginConfigs = utils.updatePluginConfigs(pluginConfigs, pluginName, {}, 'web');
  utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);

  logger.info('Building plugins...');
  return utils.buildJS('build:plugin').then(function () {
    logger.success('Building plugins successful.');
  });
};

var uninstallNewPlugin = function uninstallNewPlugin(dir, pluginName, version) {
  utils.isNewVersionPlugin(pluginName, version, function (result) {
    if (result) {
      handleUninstall(dir, pluginName, version, result);
      if (shouldUninstallPackage) {
        uninstallInPackage(dir, pluginName, version);
      }
    } else {
      logger.error('This package of weex is not support anymore! Please choose other package.');
    }
  });
};

var uninstall = function uninstall(pluginName, args) {
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
      uninstallNewPlugin(dir, pluginName, version);
    });
  } else {
    uninstallNewPlugin(dir, pluginName, version);
  }
};

module.exports = uninstall;