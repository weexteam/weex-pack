const utils = require('../utils');
const npmHelper = require('../utils/npm');
const path = require('path');
const fs = require('fs');
const xcode = require('xcode');
const plist = require('plist');
const podfile = require('./podfile');
const merge = require('merge');
const chalk = require('chalk');
const ora = require('ora');
const _ = require('underscore');
const logger = utils.logger;

const CONFIGS = require('./config');

const weexpackCommon = require('weexpack-common');

let pluginConfigs = CONFIGS.defaultConfig;

// Get plugin config in project.
const pluginConfigPath = path.join(CONFIGS.rootPath, CONFIGS.filename);
if (fs.existsSync(pluginConfigPath)) {
  pluginConfigs = JSON.parse(fs.readFileSync(pluginConfigPath));
}

let androidPluginConfigs = [];

// Get plugin config in android project.
const androidPluginConfigPath = path.join(CONFIGS.androidPath, CONFIGS.androidConfigFilename);
if (fs.existsSync(androidPluginConfigPath)) {
  androidPluginConfigs = JSON.parse(fs.readFileSync(androidPluginConfigPath));
}

const installForWeb = (plugins) => {
  if (_.isEmpty(plugins) && !_.isArray(plugins)) {
    return;
  }
  const packageJsonFile = path.join(CONFIGS.root, 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(packageJsonFile));

  plugins.forEach(plugin => {
    packageJson['dependencies'][plugin.name] = plugin.version;
  });

  packageJson = output.sortDependencies(packageJson);

  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');

  logger.info(`Downloading plugins...`);

  utils.installNpmPackage().then(() => {
    logger.info(`Building plugins...`);
    return utils.buildJS('build:plugin').then(() => {
      logger.info(`Building plugins successful.`);
    });
  });
};

const installForIOS = (plugins) => {
  if (_.isEmpty(plugins) && !_.isArray(plugins)) {
    return;
  }
  plugins.forEach(plugin => {
    const buildPatch = podfile.makeBuildPatch(plugin.name, plugin.version);
    // Build Podfile config.
    podfile.applyPatch(path.join(CONFIGS.iosPath, 'Podfile'), buildPatch);
    logger.success(`${plugin.name} has installed success in iOS project`);
  });
};
const installForAndroid = (plugins) => {
  if (_.isEmpty(plugins) && !_.isArray(plugins)) {
    return;
  }
  plugins.forEach(plugin => {
    // write .wx_config.json on `platform/android`
    androidPluginConfigs = utils.updateAndroidPluginConfigs(androidPluginConfigs, plugin.name, plugin);
    logger.success(`${plugin.name} has installed success in Android project`);
  });
  utils.writeAndroidPluginFile(CONFIGS.androidPath, androidPluginConfigPath, androidPluginConfigs);
};

const installForNewPlatform = (platforms) => {
  const pluginsList = JSON.parse(fs.readFileSync(path.join(CONFIGS.rootPath, CONFIGS.filename)));
  if (platforms && !_.isArray(platforms)) {
    platforms = [platforms];
  }
  platforms.forEach(platform => {
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

const install = (pluginName, args) => {
  let version;
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
          handleInstall(dir, pluginName, version, result);
        }
        else {
          logger.warn(`This package of weex is not support anymore! Please choose other package.`);
        }
      });
    });
  }
  else {
    utils.isNewVersionPlugin(pluginName, version, function (result) {
      if (result) {
        handleInstall(dir, pluginName, version, result);
        if (result.pluginDependencies) {
          for (const pn in result.pluginDependencies) {
            install(pn, result.pluginDependencies[pn]);
          }
        }
      }
      else {
        logger.error(`This package of weex is not support anymore! Please choose other package.`);
      }
    });
  }
};

const handleInstall = (dir, pluginName, version, option) => {
  // check out the type of current project
  const project = utils.isIOSProject(dir);
  if (project) {
    if (!fs.existsSync(path.join(dir, 'Podfile'))) {
      logger.error("can't find Podfile file");
      return;
    }
    const iosPackageName = option.ios && option.ios.name ? option.ios.name : pluginName;

    if (option.ios && option.ios.plist) {
      let projectPath;
      if (!project.isWorkspace) {
        projectPath = path.join(dir, project.name, 'project.pbxproj');
      }
      installPList(dir, projectPath, option.ios.plist || {});
    }

    if (option.ios) {
      const iosVersion = option.ios && option.ios.version || version;
      const buildPatch = podfile.makeBuildPatch(iosPackageName, iosVersion);
      // Build Podfile config.
      podfile.applyPatch(path.join(dir, 'Podfile'), buildPatch);
      logger.warn(`${pluginName} has installed success in iOS project.`);
      logger.info(`if you want to update it, please use \`weex plugin update\` command.`)
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, iosPackageName, option, 'ios');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
    }
  }
  else if (utils.isAndroidProject(dir)) {
    const androidPackageName = option.android && option.android.name ? option.android.name : pluginName;
    if (option.android) {
      androidPluginConfigs = utils.updateAndroidPluginConfigs(androidPluginConfigs, androidPackageName, option.android);
      utils.writeAndroidPluginFile(CONFIGS.androidPath, androidPluginConfigPath, androidPluginConfigs);

      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, androidPackageName, option, 'android');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
      logger.warn(`${pluginName} has installed success in Android project.`);
      logger.info(`if you want to update it, please use \`weex plugin update\` command.`)
    }
  }
  else if (utils.isCordova(dir)) {
    const platformList = utils.listPlatforms(dir);
    if (option.web) {
      // npm install
      installInPackage(dir, pluginName, version, option);
    }
    for (let i = 0; i < platformList.length; i++) {
      const platformDir = path.join(dir, 'platforms', platformList[i].toLowerCase());
      handleInstall(platformDir, pluginName, version, option);
    }
  }
  else {
    logger.info(`The project may not be a weex project, please use \`${chalk.white.bold('weex create [projectname]')}\``);
  }
};

const installPList = (projectRoot, projectPath, config) => {
  const xcodeproj = xcode.project(projectPath);
  xcodeproj.parseSync();
  const xcBuildConfiguration = xcodeproj.pbxXCBuildConfigurationSection();
  let plistFileEntry;
  let plistFile;
  for (const p in xcBuildConfiguration) {
    const entry = xcBuildConfiguration[p];
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
  }
  else {
    let obj = plist.parse(fs.readFileSync(plistFile, 'utf8'));
    obj = merge.recursive(true, obj, config);
    fs.writeFileSync(plistFile, plist.build(obj));
  }
};

const installInPackage = (dir, pluginName, version, option) => {
  const p = path.join(dir, 'package.json');
  logger.info('Downloading plugin...')
  if (fs.existsSync(p)) {
    const pkg = require(p);
    pkg.dependencies[pluginName] = version;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
  }
  utils.installNpmPackage().then(() => {
    const browserPluginName = option.web && option.web.name ? option.web.name : pluginName;
    if (option.web) {
      logger.info(`Update plugins.json...`);
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, browserPluginName, option, 'web');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
      logger.info(`Building plugins...`);
      return utils.buildJS('build:plugin').then(() => {
        logger.success(`Building plugins successful.`);
      });
    }
  });
};

module.exports = {
  install,
  installForNewPlatform
};

