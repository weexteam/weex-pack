const path = require('path');
const chalk = require('chalk');
const childprocess = require('child_process');
const utils = require('../utils');
const copy = require('recursive-copy');
const logger = utils.logger;
const {
  Platforms,
  PlatformConfig,
  AndroidConfigResolver
} = require('../utils/config');

/**
 * compile jsbundle.
 */
const copyJsbundleAssets = () => {
  logger.info(`\n=> ${chalk.blue.bold('Move JSbundle to dist')} \n`);
  const options = {
    filter: [
      '*.js',
      '!*.web.js'
    ],
    overwrite: true
  };
  return copy(path.resolve('dist'), path.resolve('platforms/android/app/src/main/assets/dist'), options)
  .on(copy.events.COPY_FILE_START, function (copyOperation) {
    logger.info('Copying file ' + copyOperation.src + '...');
  })
  .on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
    logger.info('Copied to ' + copyOperation.dest);
  })
  .on(copy.events.ERROR, function (error, copyOperation) {
    logger.error('Error:' + error.stack);
    logger.error('Unable to copy ' + copyOperation.dest);
  })
  .then(result => {
    logger.info(`Move ${result.length} files.`);
  });
};

/**
 * pass options.
 * @param {Object} options
 */
const passOptions = (options) => {
  return new Promise((resolve, reject) => {
    resolve({
      options
    });
  });
};

/**
 * Prepare
 * @param {Object} options
 */
const prepareAndroid = ({
  options
}) => {
  return new Promise((resolve, reject) => {
    const rootPath = process.cwd();
    if (!utils.checkAndroid(rootPath)) {
      logger.info(rootPath);
      logger.info(chalk.red('  Android project not found !'));
      logger.info();
      logger.info(`  You should run ${chalk.blue('weex create')} or ${chalk.blue('weex platform add android')}  first`);
      reject();
    }
    logger.info(`\n=> ${chalk.blue.bold('Will start Android app')} \n`);

    // change working directory to android
    process.chdir(path.join(rootPath, 'platforms/android'));
    if (!process.env.ANDROID_HOME) {
      logger.info();
      logger.info(chalk.red('  Environment variable $ANDROID_HOME not found !'));
      logger.info();
      logger.info(`  You should set $ANDROID_HOME first.`);
      logger.info(`  See ${chalk.cyan('http://stackoverflow.com/questions/19986214/setting-android-home-enviromental-variable-on-mac-os-x')}`);
      reject();
    }
    try {
      childprocess.execSync(`adb start-server`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      reject();
    }

    try {
      childprocess.execSync(`adb devices`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      reject();
    }
    resolve({
      options,
      rootPath
    });
  });
};

/**
 * @desc resolve config in the android project
 * @param {Object} options
 * @param {String} rootPath
 */
const resolveConfig = ({
  options,
  rootPath
}) => {
  const androidConfig = new PlatformConfig(AndroidConfigResolver, rootPath, Platforms.android);
  return androidConfig.getConfig().then((configs) => {
    AndroidConfigResolver.resolve(configs);
    return {
      options,
      rootPath,
      configs
    };
  });
};

/**
 * move assets.
 */
const copyApkAssets = ({
  options,
  rootPath,
  configs
}) => {
  logger.info(`\n=> ${chalk.blue.bold('Move APK to `release/android`')} \n`);
  const copyOptions = {
    filter: [
      '*.apk'
    ],
    overwrite: true
  };
  return copy(path.resolve('app/build/outputs/apk/'), path.resolve(path.join('../../release/android', configs.BuildVersion)), copyOptions)
  .on(copy.events.COPY_FILE_START, function (copyOperation) {
    logger.info('Copying file ' + copyOperation.src + '...');
  })
  .on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
    logger.info('Copied to ' + copyOperation.dest);
  })
  .on(copy.events.ERROR, function (error, copyOperation) {
    logger.error('Error:' + error.stack);
    logger.error('Unable to copy ' + copyOperation.dest);
  })
  .then(result => {
    logger.info(`Move ${result.length} files. SUCCESSFUL`);
  });
};

/**
 * Build the Android app
 * @param {String} device
 * @param {Object} options
 */
const buildApp = ({
  device,
  options,
  configs
}) => {
  return new Promise((resolve, reject) => {
    logger.info(`\n=> ${chalk.blue.bold('Building app ...')}\n`);
    const clean = options.clean ? ' clean' : '';
    try {
      childprocess.execSync(process.platform === 'win32' ? `call gradlew.bat ${clean} assembleRelease` : `./gradlew ${clean} assembleRelease`, {
        encoding: 'utf8',
        stdio: [0, 1]
      });
    }
    catch (e) {
      reject(e);
    }
    resolve({
      device,
      options,
      configs
    });
  });
};

/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
const buildAndroid = (options) => {
  utils.buildJS('build:prod')
    .then(copyJsbundleAssets)
    .then(() => passOptions(options))
    .then(prepareAndroid)
    .then(resolveConfig)
    .then(buildApp)
    .then(copyApkAssets)
    .catch((err) => {
      console.log(err.stack);
      if (err) {
        logger.log(chalk.red('Error:', err));
      }
    });
};

module.exports = buildAndroid;
