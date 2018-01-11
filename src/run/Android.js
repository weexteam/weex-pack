const path = require('path');
const chalk = require('chalk');
const childprocess = require('child_process');
const fs = require('fs');
const inquirer = require('inquirer');
const copy = require('recursive-copy');
const utils = require('../utils');
const server = require('./server');
const chokidar = require('chokidar');
const WebSocket = require('ws');
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
const copyJsbundleAssets = (dir, src, dist, quiet) => {
  const options = {
    filter: [
      '*.js',
      '!*.web.js'
    ],
    overwrite: true
  };
  if (!quiet) {
    logger.info(`\n=> ${chalk.blue.bold('Move JSbundle to dist')} \n`);
    return copy(path.join(dir, src), path.join(dir, dist), options)
    .on(copy.events.COPY_FILE_START, function (copyOperation) {
      quiet && logger.info('\nCopying file ' + copyOperation.src + '...');
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
  }
  return copy(path.join(dir, src), path.join(dir, dist), options);
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
      logger.info(chalk.red('Android project not found !'));
      logger.info();
      logger.info(`  You should run ${chalk.blue('weex create')} or ${chalk.blue('weex platform add android')}  first`);
      reject();
    }
    logger.info(`\n=> ${chalk.blue.bold('start Android app')} \n`);

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
  return server.startWsServer(rootPath).then(({ host, ip, port }) => {
    configs = _.extend({ Ws: host, ip, port }, configs);
    return {
      options,
      rootPath,
      configs
    };
  });
};

/**
 * @desc when the source file changed, tell native to reload the page.
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
const registeFileWatcher = (
  {
    options,
    rootPath,
    configs
  }
) => {
  const ws = new WebSocket(configs.Ws);
  // build js on watch mode.
  utils.buildJS('dev', true);
  // file watch task
  chokidar.watch(path.join(rootPath, 'dist'), { ignored: /\w*\.web\.js$/ })
  .on('change', (event) => {
    copyJsbundleAssets(rootPath, 'dist', 'platforms/android/app/src/main/assets/dist', true).then(() => {
      if (path.basename(event) === configs.WeexBundle) {
        logger.info(`\n=> ${chalk.blue.bold('Reloading page...')} \n`);
        ws.send(JSON.stringify({ method: 'WXReloadBundle', params: `http://${configs.ip}:${configs.port}/${configs.WeexBundle}` }));
      }
    });
  });
  return {
    options,
    rootPath,
    configs
  };
};

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
      devicesInfo = childprocess.execSync(`adb devices`, {
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
};

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
    else if (devicesList.length === 1) {
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
};

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
      childprocess.execSync(`adb -s ${device} reverse tcp:${configs.localhost || 8080} tcp:${configs.localhost || 8080}`, {
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
      childprocess.execSync(process.platform === 'win32' ? `call gradlew.bat ${clean} assembleDebug` : `./gradlew ${clean} assembleDebug`, {
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
      childprocess.execSync(`adb -s ${device} install -r  ${apkName}`, {
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
};

/**
 * Stringify Object to string for cli called.
 * @param {Object} configs
 */
const stringifyConfigs = (configs) => {
  let str = '\'{';
  for (const key in configs) {
    if (configs.hasOwnProperty(key)) {
      str += '\\"';
      str += key;
      str += '\\":';
      str += '\\"';
      str += configs[key];
      str += '\\",';
    }
  }
  str = str.slice(0, -1);
  str += '}\'';
  return str;
};

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
      childprocess.execSync(`adb -s ${device} shell am start -n ${packageName}/.SplashActivity -d ${stringifyConfigs({ Ws: configs.Ws })}`, {
        encoding: 'utf8'
      });
    }
    catch (e) {
      reject(e);
    }
    resolve();
  });
};

/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
const runAndroid = (options) => {
  logger.info(`\n=> ${chalk.blue.bold('npm run build')}`);
  utils.buildJS()
  .then(() => copyJsbundleAssets(process.cwd(), 'dist', 'platforms/android/app/src/main/assets/dist'))
  .then(() => passOptions(options))
  .then(prepareAndroid)
  .then(resolveConfig)
  .then(startHotReloadServer)
  .then(registeFileWatcher)
  .then(findAndroidDevice)
  .then(chooseDevice)
  .then(reverseDevice)
  .then(buildApp)
  .then(installApp)
  .then(runApp)
  .catch((err) => {
    if (err) {
      logger.log(chalk.red('Error:', err.stack));
    }
  });
};

module.exports = runAndroid;
