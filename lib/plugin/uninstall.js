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

// Get plugin config in project.
var pluginConfigPath = path.join(CONFIGS.rootPath, CONFIGS.filename);
if (fs.existsSync(pluginConfigPath)) {
  pluginConfigs = require(pluginConfigPath);
}

function uninstall(pluginName, args) {
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
      utils.isNewVersionPlugin(pluginName, version, function (result) {
        if (result) {
          handleUninstall(dir, pluginName, version, result);
          if (result.pluginDependencies) {
            for (var pn in result.pluginDependencies) {
              uninstall(pn, result.pluginDependencies[pn]);
            }
          }
        } else {
          logger.warn('This package of weex is not support anymore! Please choose other package.');
        }
      });
    });
  } else {
    utils.isNewVersionPlugin(pluginName, version, function (result) {
      if (result) {
        handleUninstall(dir, pluginName, version, result);
        if (result.pluginDependencies) {
          if (result.pluginDependencies) {
            for (var pn in result.pluginDependencies) {
              uninstall(pn, result.pluginDependencies[pn]);
            }
          }
        }
      } else {
        logger.error('This package of weex is not support anymore! Please choose other package.');
      }
    });
  }
}

function handleUninstall(dir, pluginName, version, option) {
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
    if (option.web) {
      // npm uninstall
      uninstallInPackage(dir, pluginName, version);
    }
    for (var i = 0; i < platformList.length; i++) {
      handleUninstall(path.join(dir, 'platforms', platformList[i].toLowerCase()), pluginName, version, option);
    }
  } else if (fs.existsSync(path.join(dir, 'package.json'))) {
    uninstallInPackage(dir, pluginName, version);
  } else {
    logger.info('The project may not be a weex project, please use `' + chalk.white.bold('weex create [projectname]') + '`');
  }
}

function uninstallInPackage(dir, pluginName, version) {
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
}

module.exports = uninstall;