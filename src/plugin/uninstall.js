const npm = require('npm');
const utils = require('../utils');
const npmHelper = require('../utils/npm');
const path = require('path');
const shell = require('shelljs');
const fs = require('fs');
const chalk = require('chalk');
const gradle = require('./gradle');
const podfile = require('./podfile');

const CONFIGS = require('./config');
const weexpackCommon = require('weexpack-common');
const logger = weexpackCommon.CordovaLogger.get();

let pluginConfigs = CONFIGS.defaultConfig;

// Get plugin config in project.
const pluginConfigPath = path.join(CONFIGS.rootPath, CONFIGS.filename);
if (fs.existsSync(pluginConfigPath)) {
  pluginConfigs = require(pluginConfigPath);
}

function uninstall (pluginName, args) {
  let version;
  const target = pluginName;
  if (/@/ig.test(pluginName)) {
    const temp = pluginName.split('@');
    pluginName = temp[0];
    version = temp[1];
  }

  const dir = process.cwd();

  // get the lastest version
  if (!version) {
    npmHelper.getLastestVersion(pluginName, function (version) {
      utils.isNewVersionPlugin(pluginName, version, function (result) {
        if (result) {
          handleUninstall(dir, pluginName, version, result);
          if (result.pluginDependencies) {
            for (const pn in result.pluginDependencies) {
              uninstall(pn, result.pluginDependencies[pn]);
            }
          }
        }
        else {
          logger.info(`${chalk.red('This package of weex is not support anymore! Please choose other package.')}`)
        }
      });
    });
  }
  else {
    utils.isNewVersionPlugin(pluginName, version, function (result) {
      if (result) {
        handleUninstall(dir, pluginName, version, result);
        if (result.pluginDependencies) {
          if (result.pluginDependencies) {
            for (const pn in result.pluginDependencies) {
              uninstall(pn, result.pluginDependencies[pn]);
            }
          }
        }
      }
      else {
        logger.info(`${chalk.red('This package of weex is not support anymore! Please choose other package.')}`)
        // (args);
        // cordova.raw["plugin"]("remove", [target]);
      }
    });
  }
}

function handleUninstall (dir, pluginName, version, option) {
  // check out the type of current project
  let project;
  if (project = utils.isIOSProject(dir)) {
    if (!fs.existsSync(path.join(dir, 'Podfile'))) {
      logger.info("can't find Podfile file");
      return;
    }
    const iosPackageName = option.ios && option.ios.name ? option.ios.name : pluginName;
    const iosVersion = option.ios && option.ios.version || version;
    const buildPatch = podfile.makeBuildPatch(iosPackageName, iosVersion);
    // Remove Podfile config.
    podfile.revokePatch(path.join(dir, 'Podfile'), buildPatch);
    logger.info(`=> ${pluginName} has removed in iOS project`);
    // Update plugin.json in the project.
    pluginConfigs = utils.updatePluginConfigs(pluginConfigs, iosPackageName, '', 'ios');
    utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
  }
  else if (utils.isAndroidProject(dir)) {
    const androidPackageName = option.android && option.android.name ? option.android.name : pluginName;
    const androidVersion = option.android && option.android.version || version;
    const buildPatch = gradle.makeBuildPatch(androidPackageName, androidVersion, option.android.groupId || '');
    // Remove gradle config.
    gradle.revokePatch(path.join(dir, 'build.gradle'), buildPatch);
    logger.info(`=> ${pluginName} has removed in Android project`);
    // Update plugin.json in the project.
    pluginConfigs = utils.updatePluginConfigs(pluginConfigs, androidPackageName, '', 'android');
    utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
  }
  else if (utils.isCordova(dir)) {
    const platformList = utils.listPlatforms(dir);
    if (option.web) {
      // npm uninstall
      uninstallInPackage(dir, pluginName, version);
    }
    for (let i = 0; i < platformList.length; i++) {
      handleUninstall(path.join(dir, 'platforms', platformList[i].toLowerCase()), pluginName, version, option);
    }
  }
  else if (fs.existsSync(path.join(dir, 'package.json'))) {
    uninstallInPackage(dir, pluginName, version);
  }
  else {
    logger.info("can't recognize type of this project");
  }
}

function uninstallInPackage (dir, pluginName, version) {
  const packageJsonPath = path.join(dir, 'package.json');
  //Update package.json
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    if (packageJson.dependencies[pluginName]) {
      delete packageJson.dependencies[pluginName];
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
  logger.info(`${chalk.blue.bold('\n=> Update plugins.json...\n')}`)
  // Update plugin.json in the project.
  pluginConfigs = utils.updatePluginConfigs(pluginConfigs, pluginName, {}, 'web');
  utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);

  logger.info(`${chalk.blue.bold('\n=> Building plugins...\n')}`)
  return utils.buildJS('build:plugin').then(() => {
    logger.info(`${chalk.blue.bold('\n=> Building plugins successful.\n')}`)
  })
}

module.exports = uninstall;

