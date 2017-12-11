const npm = require('npm');
const utils = require('../utils');
const npmHelper = require('../utils/npm');
const path = require('path');
const shell = require('shelljs');
const fs = require('fs');
const xcode = require('xcode');
const plist = require('plist');
const gradle = require('./gradle');
const podfile = require('./podfile');
const merge = require('merge');
const chalk = require('chalk');
const cli = require('../cli');
const cordova_lib = require('../../lib');
const cordova = cordova_lib.cordova;

const cordovaUtils = require('../../lib/src/cordova/util');

const semver = require('semver');

const CONFIGS = require('./config');

let pluginConfigs = CONFIGS.defaultConfig;

// Get plugin config in project.
const pluginConfigPath = path.join(CONFIGS.rootPath, CONFIGS.filename);
if (fs.existsSync(pluginConfigPath)) {
  pluginConfigs = require(pluginConfigPath);
}


let androidPluginConfigs = [];

// Get plugin config in android project.
const androidPluginConfigPath = path.join(CONFIGS.androidPath, CONFIGS.androidConfigFilename);
if (fs.existsSync(androidPluginConfigPath)) {
  androidPluginConfigs = require(androidPluginConfigPath);
}



const install = (pluginName, args) => {
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
          // if (result.pluginDependencies) {
          //   for (const pn in result.pluginDependencies) {
          //     install(pn, result.pluginDependencies[pn]);
          //   }
          // }
          handleInstall(dir, pluginName, version, result);
        }
        else {
          console.log(`${chalk.red('This package of weex is not support anymore! Please choose other package.')}`)
          // cli(args);
           // cordova.raw["plugin"]("add", [target]);
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
        console.log(`${chalk.red('This package of weex is not support anymore! Please choose other package.')}`)
        // cli(args);
        // cordova.raw["plugin"]("add", [target]);
      }
    });
  }
}

const handleInstall = (dir, pluginName, version, option) => {
  // check out the type of current project
  let project;
  if (project = utils.isIOSProject(dir)) {
    if (!fs.existsSync(path.join(dir, 'Podfile'))) {
      console.log("can't find Podfile file");
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
      console.log(`=> ${pluginName} has installed success in iOS project`);
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, iosPackageName, option, 'ios');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
    }
  }
  else if (utils.isAndroidProject(dir)) {
    const androidPackageName = option.android && option.android.name ? option.android.name : pluginName;
    if (option.android) {
      const androidVersion = option.android && option.android.version || version;
      // Build gradle config.
      const buildPatch = gradle.makeBuildPatch(androidPackageName, androidVersion, option.android.groupId || '');
      gradle.applyPatch(path.join(dir, 'build.gradle'), buildPatch);
      console.log(`=> ${pluginName} has installed success in Android project`);
      
      
      androidPluginConfigs = utils.updateAndroidPluginConfigs(androidPluginConfigs, androidPackageName, option.android);
      utils.writeAndroidPluginFile(CONFIGS.androidPath, androidPluginConfigPath, androidPluginConfigs);
      
      
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, androidPackageName, option, 'android');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
    }
  }
  else if (cordovaUtils.isCordova(dir)) {
    const platformList = cordovaUtils.listPlatforms(dir);
    // npm install
    installInPackage(dir, pluginName, version, option);

    for (let i = 0; i < platformList.length; i++) {
      const platformDir = path.join(dir, 'platforms', platformList[i].toLowerCase());
      handleInstall(platformDir, pluginName, version, option);
    }
  }
  else {
    console.log("can't recognize type of this project");
  }
}

const installPList = (projectRoot, projectPath, config) => {
  const xcodeproj = xcode.project(projectPath);
  xcodeproj.parseSync();

  const xcBuildConfiguration = xcodeproj.pbxXCBuildConfigurationSection();

  for (const p in xcBuildConfiguration) {
    const entry = xcBuildConfiguration[p];
    if (entry.buildSettings && entry.buildSettings.INFOPLIST_FILE) {
      var plist_file_entry = entry;
      break;
    }
  }
  if (plist_file_entry) {
    var plist_file = path.join(projectRoot, plist_file_entry.buildSettings.INFOPLIST_FILE.replace(/^"(.*)"$/g, '$1').replace(/\\&/g, '&'));
  }

  if (!fs.existsSync(plist_file)) {
    console.error('Could not find *-Info.plist file');
  }
  else {
    let obj = plist.parse(fs.readFileSync(plist_file, 'utf8'));
    obj = merge.recursive(true, obj, config);
    console.log(plist.build(obj), 'Plist build')
    fs.writeFileSync(plist_file, plist.build(obj));
  }
}

const installInPackage = (dir, pluginName, version, option) => {
  const p = path.join(dir, 'package.json');
  if (fs.existsSync(p)) {
    const pkg = require(p);
    pkg.dependencies[pluginName] = version;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2));
  }
  utils.installNpmPackage().then(() => {
    const browserPluginName = option.web && option.web.name ? option.web.name : pluginName;
    if (option.web) {
      // Update plugin.json in the project.
      pluginConfigs = utils.updatePluginConfigs(pluginConfigs, browserPluginName, option, 'web');
      utils.writePluginFile(CONFIGS.rootPath, pluginConfigPath, pluginConfigs);
    }
  })
}

module.exports = install;

