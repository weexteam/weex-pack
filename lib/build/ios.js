'use strict';

var path = require('path');
var chalk = require('chalk');
var childprocess = require('child_process');
var copy = require('recursive-copy');
var utils = require('../utils');
var _ = require('underscore');
var logger = require('weexpack-common').CordovaLogger.get();

var _require = require('../utils/config'),
    PlatformConfig = _require.PlatformConfig,
    iOSConfigResolver = _require.iOSConfigResolver,
    Platforms = _require.Platforms;

/**
 * compile jsbundle.
 */


var copyJsbundleAssets = function copyJsbundleAssets() {
  logger.info('Move JSbundle to dist');
  var options = {
    filter: ['*.js', '!*.web.js'],
    overwrite: true
  };
  return copy(path.resolve('dist'), path.resolve('platforms/ios/bundlejs/'), options).on(copy.events.COPY_FILE_START, function (copyOperation) {
    logger.info('Copying file ' + copyOperation.src + '...');
  }).on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
    logger.info('Copied to ' + copyOperation.dest);
  }).on(copy.events.ERROR, function (error, copyOperation) {
    logger.error('Error:' + error.stack);
    logger.error('Unable to copy ' + copyOperation.dest);
  }).then(function (result) {
    logger.info('Move ' + result.length + ' files.');
  });
};

/**
 * pass options.
 * @param {Object} options
 */
var passOptions = function passOptions(options) {
  return new Promise(function (resolve, reject) {
    resolve({
      options: options
    });
  });
};

/**
 * Prepare
 * @param {Object} options
 */
var prepareIOS = function prepareIOS(_ref) {
  var options = _ref.options;

  return new Promise(function (resolve, reject) {
    var rootPath = process.cwd();
    if (!utils.checkIOS(rootPath)) {
      logger.error('iOS project not found !');
      logger.info('You should run ' + chalk.blue('weex create') + ' or ' + chalk.blue('weex platform add ios') + ' first');
      reject();
    }
    // change working directory to ios
    process.chdir(path.join(rootPath, 'platforms/ios'));

    var xcodeProject = utils.findXcodeProject(process.cwd());

    if (xcodeProject) {
      logger.info('start iOS app');
      resolve({ xcodeProject: xcodeProject, options: options, rootPath: rootPath });
    } else {
      logger.error('Could not find Xcode project files in ios folder.');
      logger.info('Please make sure you have installed iOS Develop Environment and CocoaPods');
      reject();
    }
  });
};

/**
 * Install dependency
 * @param {Object} xcode project
 * @param {Object} options
 */
var installDep = function installDep(_ref2) {
  var xcodeProject = _ref2.xcodeProject,
      options = _ref2.options,
      rootPath = _ref2.rootPath,
      configs = _ref2.configs;

  logger.info('pod update');
  return utils.exec('pod update').then(function () {
    return { xcodeProject: xcodeProject, options: options, rootPath: rootPath, configs: configs };
  });
};

/**
 * @desc resolve config in the android project
 * @param {Object} options
 * @param {String} rootPath
 */
var resolveConfig = function resolveConfig(_ref3) {
  var xcodeProject = _ref3.xcodeProject,
      options = _ref3.options,
      rootPath = _ref3.rootPath;

  var iosConfig = new PlatformConfig(iOSConfigResolver, rootPath, Platforms.ios, { Ws: '' });
  return iosConfig.getConfig().then(function (configs) {
    iOSConfigResolver.resolve(configs);
    return {
      xcodeProject: xcodeProject,
      options: options,
      rootPath: rootPath,
      configs: configs
    };
  });
};

/**
 * build the iOS app on simulator or real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var buildApp = function buildApp(_ref4) {
  var xcodeProject = _ref4.xcodeProject,
      options = _ref4.options,
      rootPath = _ref4.rootPath,
      configs = _ref4.configs;

  return new Promise(function (resolve, reject) {
    var projectInfo = '';
    try {
      projectInfo = utils.getIOSProjectInfo();
    } catch (e) {
      reject(e);
    }

    var scheme = projectInfo.project.schemes[0];

    logger.info('Buiding project...');
    try {
      if (_.isEmpty(configs)) {
        reject(new Error('iOS config dir not detected.'));
      }
      childprocess.execSync('xcodebuild -' + (xcodeProject.isWorkspace ? 'workspace' : 'project') + ' ' + xcodeProject.name + ' -scheme ' + scheme + ' -configuration PROD -sdk iphoneos -derivedDataPath build clean build', { encoding: 'utf8' });
    } catch (e) {
      reject(e);
    }
    resolve({ xcodeProject: xcodeProject, options: options, rootPath: rootPath, configs: configs });
  });
};

/**
 * move assets.
 */
var copyReleaseAssets = function copyReleaseAssets(_ref5) {
  var options = _ref5.options,
      rootPath = _ref5.rootPath,
      configs = _ref5.configs;

  logger.info('Move Release File to `release/ios`');
  var copyOptions = {
    filter: ['*.apk'],
    overwrite: true
  };
  return copy(path.resolve('build/Build/Products/Release-iphoneos'), path.resolve(path.join('../../release/ios', configs.BuildVersion)), copyOptions).on(copy.events.COPY_FILE_START, function (copyOperation) {
    logger.info('Copying file ' + copyOperation.src + '...');
  }).on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
    logger.info('Copied to ' + copyOperation.dest);
  }).on(copy.events.ERROR, function (error, copyOperation) {
    logger.error('Error:' + error.stack);
    logger.error('Unable to copy ' + copyOperation.dest);
  }).then(function (result) {
    logger.info('Move ' + result.length + ' files. SUCCESSFUL');
  });
};

/**
 * Build iOS app
 * @param {Object} options
 */
var buildIOS = function buildIOS(options) {
  utils.checkAndInstallForIosDeploy().then(utils.buildJS).then(copyJsbundleAssets).then(function () {
    return passOptions(options);
  }).then(prepareIOS).then(installDep).then(resolveConfig).then(buildApp).then(copyReleaseAssets).catch(function (err) {
    if (err) {
      logger.error(err);
      var errTips = 'You should config `CodeSign` and `Profile` in the `ios.config.json`\n\n    We suggest that you open the `platform/ios` directory.\n\n    Package your project as a normal ios project!';
      logger.error(errTips);
    }
  });
};

module.exports = buildIOS;