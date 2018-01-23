'use strict';

var path = require('path');
var chalk = require('chalk');
var childprocess = require('child_process');
var utils = require('../utils');
var copy = require('recursive-copy');
var logger = utils.logger;

var _require = require('../utils/config'),
    Platforms = _require.Platforms,
    PlatformConfig = _require.PlatformConfig,
    AndroidConfigResolver = _require.AndroidConfigResolver;

/**
 * compile jsbundle.
 */


var copyJsbundleAssets = function copyJsbundleAssets() {
  logger.info('Move JSbundle to dist\')} \n');
  var options = {
    filter: ['*.js', '!*.web.js'],
    overwrite: true
  };
  return copy(path.resolve('dist'), path.resolve('platforms/android/app/src/main/assets/dist'), options).on(copy.events.COPY_FILE_START, function (copyOperation) {
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
var prepareAndroid = function prepareAndroid(_ref) {
  var options = _ref.options;

  return new Promise(function (resolve, reject) {
    var rootPath = process.cwd();
    if (!utils.checkAndroid(rootPath)) {
      logger.info(rootPath);
      logger.info(chalk.red('Android project not found !'));
      logger.info('You should run ' + chalk.yellow('weex create') + ' or ' + chalk.yellow('weex platform add android') + '  first');
      reject();
    }
    logger.info('Will start Android app');

    // change working directory to android
    process.chdir(path.join(rootPath, 'platforms/android'));
    if (!process.env.ANDROID_HOME) {
      logger.error('Environment variable ANDROID_HOME not found !');
      logger.log('You should set ANDROID_HOME in your environment first.');
      logger.log('See ' + chalk.cyan('https://spring.io/guides/gs/android/'));
      reject();
    }
    try {
      childprocess.execSync('adb start-server', {
        encoding: 'utf8'
      });
    } catch (e) {
      reject();
    }

    try {
      childprocess.execSync('adb devices', {
        encoding: 'utf8'
      });
    } catch (e) {
      reject();
    }
    resolve({
      options: options,
      rootPath: rootPath
    });
  });
};

/**
 * @desc resolve config in the android project
 * @param {Object} options
 * @param {String} rootPath
 */
var resolveConfig = function resolveConfig(_ref2) {
  var options = _ref2.options,
      rootPath = _ref2.rootPath;

  var androidConfig = new PlatformConfig(AndroidConfigResolver, rootPath, Platforms.android);
  return androidConfig.getConfig().then(function (configs) {
    AndroidConfigResolver.resolve(configs);
    return {
      options: options,
      rootPath: rootPath,
      configs: configs
    };
  });
};

/**
 * move assets.
 */
var copyApkAssets = function copyApkAssets(_ref3) {
  var options = _ref3.options,
      rootPath = _ref3.rootPath,
      configs = _ref3.configs;

  logger.info('Move APK to `release/android`');
  var copyOptions = {
    filter: ['*.apk'],
    overwrite: true
  };
  return copy(path.resolve('app/build/outputs/apk/'), path.resolve(path.join('../../release/android', configs.BuildVersion || '')), copyOptions).on(copy.events.COPY_FILE_START, function (copyOperation) {
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
 * Build the Android app
 * @param {String} device
 * @param {Object} options
 */
var buildApp = function buildApp(_ref4) {
  var device = _ref4.device,
      options = _ref4.options,
      configs = _ref4.configs;

  return new Promise(function (resolve, reject) {
    logger.info('Building app ...');
    var clean = options.clean ? ' clean' : '';
    try {
      childprocess.execSync(process.platform === 'win32' ? 'call gradlew.bat ' + clean + ' assembleRelease' : './gradlew ' + clean + ' assembleRelease', {
        encoding: 'utf8',
        stdio: [0, 1]
      });
    } catch (e) {
      reject(e);
    }
    resolve({
      device: device,
      options: options,
      configs: configs
    });
  });
};

/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
var buildAndroid = function buildAndroid(options) {
  utils.buildJS('build:prod').then(copyJsbundleAssets).then(function () {
    return passOptions(options);
  }).then(prepareAndroid).then(resolveConfig).then(buildApp).then(copyApkAssets).catch(function (err) {
    console.log(err.stack);
    if (err) {
      logger.log(chalk.red('Error:', err));
    }
  });
};

module.exports = buildAndroid;