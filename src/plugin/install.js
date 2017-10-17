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
const cli = require('../cli');

let cordova_lib = require('../../lib'),
  cordova = cordova_lib.cordova;

const cordovaUtils = require('../../lib/src/cordova/util');

const semver = require('semver');

function install (pluginName, args) {
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
          handleInstall(dir, pluginName, version, result);
          if (result.pluginDependencies) {
            for (const pn in result.pluginDependencies) {
              install(pn, result.pluginDependencies[pn]);
            }
          }
        }
        else {
          cli(args);
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
        cli(args);
        // cordova.raw["plugin"]("add", [target]);
      }
    });
  }

  // 判断是否是新版本
}

function handleInstall (dir, pluginName, version, option) {
  // check out the type of current project
  let project;
  if (project = utils.isIOSProject(dir)) {
    if (!fs.existsSync(path.join(dir, 'Podfile'))) {
      console.log("can't find Podfile file");
      return;
    }
    var name = option.ios && option.ios.name ? option.ios.name : pluginName;

    if (option.ios && option.ios.plist) {
      let projectPath;
      if (!project.isWorkspace) {
        projectPath = path.join(dir, project.name, 'project.pbxproj');
      }
      installPList(dir, projectPath, option.ios.plist || {});
    }

    if (option.ios && option.ios.type == 'pod') {
      const iosVersion = option.ios && option.ios.version || version;
      const buildPatch = podfile.makeBuildPatch(name, iosVersion);
      podfile.applyPatch(path.join(dir, 'Podfile'), buildPatch);
      console.log(name + ' install success in ios project');
    }
    else {
      npmHelper.fetchCache(pluginName, version, function (packageTGZ, packageDir) {
        npmHelper.unpackTgz(packageTGZ, path.join(process.cwd(), 'weexplugins', pluginName), function () {
          const targetPath = path.join(process.cwd(), 'weexplugins', pluginName);
          const buildPatch = podfile.makeBuildPatch(targetPath, '');
          podfile.applyPatch(path.join(dir, 'Podfile'), buildPatch);
          console.log(name + ' install success in ios project');
        });
      });
    }
  }
  else if (utils.isAndroidProject(dir)) {
    var name = option.android && option.android.name ? option.android.name : pluginName;
    if (option.android && option.android.type == 'maven') {
      const androidVersion = option.android && option.android.version || version;
      const buildPatch = gradle.makeBuildPatch(name, androidVersion, option.android.groupId || '');
      gradle.applyPatch(path.join(dir, 'build.gradle'), buildPatch);
      console.log(name + ' install success in android project');
    }
    else {
      npmHelper.fetchCache(pluginName, version, function (packageTGZ, packageDir) {
        npmHelper.unpackTgz(packageTGZ, path.join(process.cwd(), 'weexplugins', pluginName), function () {
          const targetPath = path.join(process.cwd(), 'weexplugins', pluginName);
            //
          const settingPatch = gradle.makeSettingsPatch(pluginName, targetPath);
          gradle.applyPatch(path.join(dir, 'settings.gradle'), settingPatch);

          const buildPatch = gradle.makeBuildPatch(name, version, option.android.groupId || '');
          gradle.applyPatch(path.join(dir, 'build.gradle'), buildPatch, true);
          console.log(name + ' install success in android project');
        });
      });
    }
  }
  // cordova工程
  else if (cordovaUtils.isCordova(dir)) {
    const platformList = cordovaUtils.listPlatforms(dir);
    for (let i = 0; i < platformList.length; i++) {
      // npm install

      installInPackage(dir, pluginName, version);
      const platformDir = path.join(dir, 'platforms', platformList[i].toLowerCase());
      handleInstall(platformDir, pluginName, version, option);
    }
  }
  else if (fs.existsSync(path.join(dir, 'package.json'))) {
    installInPackage(dir, pluginName, version);
    console.log(name + ' install success ');
  }
  else {
    console.log("can't recognize type of this project");
  }
}

function installPList (projectRoot, projectPath, config) {
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

    fs.writeFileSync(plist_file, plist.build(obj));
  }
}

function installInPackage (dir, pluginName, version, option) {
  const p = path.join(dir, 'package.json');
  if (fs.existsSync(p)) {
    const pkg = require(p);
    pkg.dependencies[pluginName] = version;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 4));
  }
}

module.exports = install;

