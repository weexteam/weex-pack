const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const fs = require('fs');
const inquirer = require('inquirer');
const copy = require('recursive-copy');
const utils = require('../utils');
const server = require('./server');
const _ = require('underscore');
const logger = require('weexpack-common').CordovaLogger.get();
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
  .on(copy.events.COPY_FILE_START, function(copyOperation) {
    logger.info('Copying file ' + copyOperation.src + '...');
  })
  .on(copy.events.COPY_FILE_COMPLETE, function(copyOperation) {
    logger.info('Copied to ' + copyOperation.dest);
  })
  .on(copy.events.ERROR, function(error, copyOperation) {
    logger.error('Unable to copy ' + copyOperation.dest);
  })
  .then(result => {
    logger.info(`Move ${result.length} files.`);
  })
}


/**
 * pass options.
 * @param {Object} options
 */
const passOptions = (options) => {
  return new Promise((resolve, reject) => {
    resolve({
      options
    })
  })
}

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
      child_process.execSync(`adb start-server`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      reject();
    }
  
    try {
      child_process.execSync(`adb devices`, {
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
}

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
}

/**
 * @desc start websocker server for hotreload
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
const startHotReloadServer = (
  {
    options,
    rootPath,
    configs
  }
) => {
  return server.startWsServer().then(host => {
    configs = _.extend({Ws:host}, configs);
    return {
      options,
      rootPath,
      configs
    }
  })
}

/**
 * find android devices
 * @param {Object} options
 * @param {Object} configs
 */
const findAndroidDevice = ({
  options,
  configs
}) => {
  return new Promise((resolve, reject) => {
    let devicesInfo = '';
    try {
      devicesInfo = child_process.execSync(`adb devices`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      logger.info(chalk.red(`adb devices failed, please make sure you have adb in your PATH.`));
      logger.info(`See ${chalk.cyan('http://stackoverflow.com/questions/27301960/errorunable-to-locate-adb-within-sdk-in-android-studio')}`);
      reject();
    }
    const devicesList = utils.parseDevicesResult(devicesInfo);
    resolve({
      devicesList,
      options,
      configs
    });
  });
}

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} options
 */
const chooseDevice = ({
  devicesList,
  options,
  configs
}) => {
  return new Promise((resolve, reject) => {
    if (devicesList && devicesList.length > 1) {
      const listNames = [new inquirer.Separator(' = devices = ')];
      for (const device of devicesList) {
        listNames.push({
          name: `${device}`,
          value: device
        });
      }
      inquirer.prompt([{
        type: 'list',
        message: 'Choose one of the following devices',
        name: 'chooseDevice',
        choices: listNames
      }]).then((answers) => {
        const device = answers.chooseDevice;
        resolve({
          device,
          options
        });
      });
    }
    else if (devicesList.length == 1) {
      resolve({
        device: devicesList[0],
        options,
        configs
      });
    }
    else {
      reject('No android devices found.');
    }
  });
}

/**
 * Adb reverse device, allow device connect host network
 * @param {String} device
 * @param {Object} options
 */
const reverseDevice = ({
  device,
  options,
  configs
}) => {
  return new Promise((resolve, reject) => {
    try {
      const s = child_process.execSync(`adb -s ${device} reverse tcp:${configs.localhost || 8080} tcp:${configs.localhost || 8080}`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      logger.error('reverse error[ignored]');
      resolve({
        device,
        options,
        configs
      });
    }
    resolve({
      device,
      options,
      configs
    });
  });
}

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
      child_process.execSync(process.platform === 'win32' ? `call gradlew.bat ${clean} assembleDebug` : `./gradlew ${clean} assembleDebug`, {
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
}

/**
 * Install the Android app
 * @param {String} device
 * @param {Object} options
 * @param {Object} configs
 */
const installApp = ({
  device,
  options,
  configs
}) => {
  return new Promise((resolve, reject) => {
    logger.info(`\n=> ${chalk.blue.bold('Install app ...')}\n`);
    const apkName = 'app/build/outputs/apk/weex-app.apk';
    try {
      child_process.execSync(`adb -s ${device} install -r  ${apkName}`, {
        encoding: 'utf8'
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
}

/**
 * Stringify Object to string for cli called.
 * @param {Object} configs
 */
const stringifyConfigs = (configs) => {
  let str = '\'{';
  for(let key in configs) {
    if (configs.hasOwnProperty(key)) {
      str +='\\"'
      str +=key;
      str +='\\":'
      str +='\\"'
      str +=configs[key];
      str +='\\",'
    }
  }
  str = str.slice(0, -1);
  str += '}\'';
  return str;
}

/**
 * Run the Android app on emulator or device
 * @param {String} device
 * @param {Object} options
 */
const runApp = ({
  device,
  options,
  configs
}) => {
  return new Promise((resolve, reject) => {
    logger.info(`\n=> ${chalk.blue.bold('Running app ...')}`);
    const packageName = fs.readFileSync('app/src/main/AndroidManifest.xml', 'utf8').match(/package="(.+?)"/)[1];
    try {
      child_process.execSync(`adb -s ${device} shell am start -n ${packageName}/.SplashActivity -d ${stringifyConfigs({Ws: configs.Ws})}`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      reject(e);
    }
    resolve();
  });
}


/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
const runAndroid = (options) => {
  logger.info(`\n=> ${chalk.blue.bold('npm run build')}`);
  utils.buildJS()
  .then(copyJsbundleAssets)
  .then(() => passOptions(options))
  .then(prepareAndroid)
  .then(resolveConfig)
  .then(startHotReloadServer)
  .then(findAndroidDevice)
  .then(chooseDevice)
  .then(reverseDevice)
  .then(buildApp)
  .then(installApp)
  .then(runApp)
  .catch((err) => {
    console.log(err.stack)
    if (err) {
      logger.log(chalk.red('Error:', err));
    }
  });
}

module.exports = runAndroid;
