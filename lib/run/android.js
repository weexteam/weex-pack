'use strict';

var path = require('path');
var chalk = require('chalk');
var childprocess = require('child_process');
var fs = require('fs');
var inquirer = require('inquirer');
var copy = require('recursive-copy');
var utils = require('../utils');
var server = require('./server');
var chokidar = require('chokidar');
var WebSocket = require('ws');
var exit = require('exit');
var _ = require('underscore');
var logger = utils.logger;

var _require = require('../utils/config'),
    Platforms = _require.Platforms,
    PlatformConfig = _require.PlatformConfig,
    AndroidConfigResolver = _require.AndroidConfigResolver;

/**
 * compile jsbundle.
 */


var copyJsbundleAssets = function copyJsbundleAssets(dir, src, dist, quiet) {
  var options = {
    filter: ['*.js', '!*.web.js'],
    overwrite: true
  };
  if (!quiet) {
    logger.info('Move JSbundle to dist\'');
    return copy(path.join(dir, src), path.join(dir, dist), options).on(copy.events.COPY_FILE_START, function (copyOperation) {
      quiet && logger.info('Copying file ' + copyOperation.src + '...');
    }).on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
      logger.info('Copied to ' + copyOperation.dest);
    }).on(copy.events.ERROR, function (error, copyOperation) {
      logger.error('Error: ' + (error || error.stack));
      logger.error('Unable to copy ' + copyOperation.dest);
    }).then(function (result) {
      logger.info('Move ' + result.length + ' files.');
    });
  }
  return copy(path.join(dir, src), path.join(dir, dist), options);
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
 * check if there has a android project.
 */
var shouldRunAndroid = function shouldRunAndroid() {
  return new Promise(function (resolve, reject) {
    var rootPath = process.cwd();
    if (!utils.checkAndroid(rootPath)) {
      logger.error('Android project not found!');
      logger.log('You should run ' + chalk.yellow('weex create') + ' or ' + chalk.yellow('weex platform add android') + '  first');
      reject();
    }
    resolve();
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

    logger.info('start Android app \n');

    // change working directory to android
    process.chdir(path.join(rootPath, 'platforms/android'));
    if (!process.env.ANDROID_HOME) {
      logger.error('Environment variable $ANDROID_HOME not found !');
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
 * @desc start websocker server for hotreload
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
var startHotReloadServer = function startHotReloadServer(_ref3) {
  var options = _ref3.options,
      rootPath = _ref3.rootPath,
      configs = _ref3.configs;

  return server.startWsServer(rootPath).then(function (_ref4) {
    var host = _ref4.host,
        ip = _ref4.ip,
        port = _ref4.port;

    configs = _.extend({ Ws: host, ip: ip, port: port }, configs);
    return {
      options: options,
      rootPath: rootPath,
      configs: configs
    };
  });
};

/**
 * @desc when the source file changed, tell native to reload the page.
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
var registeFileWatcher = function registeFileWatcher(_ref5) {
  var options = _ref5.options,
      rootPath = _ref5.rootPath,
      configs = _ref5.configs;

  var ws = new WebSocket(configs.Ws);
  // build js on watch mode.
  utils.buildJS('dev', true);
  // file watch task
  chokidar.watch(path.join(rootPath, 'dist'), { ignored: /\w*\.web\.js$/ }).on('change', function (event) {
    copyJsbundleAssets(rootPath, 'dist', 'platforms/android/app/src/main/assets/dist', true).then(function () {
      if (path.basename(event) === configs.WeexBundle) {
        logger.info('Reloading page... \n');
        ws.send(JSON.stringify({ method: 'WXReloadBundle', params: 'http://' + configs.ip + ':' + configs.port + '/' + configs.WeexBundle }));
      }
    });
  });
  return {
    options: options,
    rootPath: rootPath,
    configs: configs
  };
};

/**
 * find android devices
 * @param {Object} options
 * @param {Object} configs
 */
var findAndroidDevice = function findAndroidDevice(_ref6) {
  var options = _ref6.options,
      configs = _ref6.configs;

  return new Promise(function (resolve, reject) {
    var devicesInfo = '';
    try {
      devicesInfo = childprocess.execSync('adb devices', {
        encoding: 'utf8'
      });
    } catch (e) {
      logger.info(chalk.red('adb devices failed, please make sure you have adb in your PATH.'));
      logger.info('See ' + chalk.cyan('http://stackoverflow.com/questions/27301960/errorunable-to-locate-adb-within-sdk-in-android-studio'));
      reject();
    }
    var devicesList = utils.parseDevicesResult(devicesInfo);
    resolve({
      devicesList: devicesList,
      options: options,
      configs: configs
    });
  });
};

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} options
 */
var chooseDevice = function chooseDevice(_ref7) {
  var devicesList = _ref7.devicesList,
      options = _ref7.options,
      configs = _ref7.configs;

  return new Promise(function (resolve, reject) {
    if (devicesList && devicesList.length > 1) {
      var listNames = [new inquirer.Separator(' = devices = ')];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = devicesList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var device = _step.value;

          listNames.push({
            name: '' + device,
            value: device
          });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      inquirer.prompt([{
        type: 'list',
        message: 'Choose one of the following devices',
        name: 'chooseDevice',
        choices: listNames
      }]).then(function (answers) {
        var device = answers.chooseDevice;
        resolve({
          device: device,
          options: options
        });
      });
    } else if (devicesList.length === 1) {
      resolve({
        device: devicesList[0],
        options: options,
        configs: configs
      });
    } else {
      reject('No android devices found.');
    }
  });
};

/**
 * Adb reverse device, allow device connect host network
 * @param {String} device
 * @param {Object} options
 */
var reverseDevice = function reverseDevice(_ref8) {
  var device = _ref8.device,
      options = _ref8.options,
      configs = _ref8.configs;

  return new Promise(function (resolve, reject) {
    try {
      childprocess.execSync('adb -s ' + device + ' reverse tcp:' + (configs.localhost || 8080) + ' tcp:' + (configs.localhost || 8080), {
        encoding: 'utf8'
      });
    } catch (e) {
      logger.error('reverse error[ignored]');
      resolve({
        device: device,
        options: options,
        configs: configs
      });
    }
    resolve({
      device: device,
      options: options,
      configs: configs
    });
  });
};

/**
 * Build the Android app
 * @param {String} device
 * @param {Object} options
 */
var buildApp = function buildApp(_ref9) {
  var device = _ref9.device,
      options = _ref9.options,
      configs = _ref9.configs;

  return new Promise(function (resolve, reject) {
    logger.info('Building app ...\n');
    var clean = options.clean ? ' clean' : '';
    try {
      childprocess.execSync(process.platform === 'win32' ? 'call gradlew.bat ' + clean + ' assembleDebug' : './gradlew ' + clean + ' assembleDebug', {
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
 * Install the Android app
 * @param {String} device
 * @param {Object} options
 * @param {Object} configs
 */
var installApp = function installApp(_ref10) {
  var device = _ref10.device,
      options = _ref10.options,
      configs = _ref10.configs;

  return new Promise(function (resolve, reject) {
    logger.info('Install app ...\n');
    var apkName = 'app/build/outputs/apk/weex-app.apk';
    try {
      childprocess.execSync('adb -s ' + device + ' install -r  ' + apkName, {
        encoding: 'utf8'
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
 * Stringify Object to string for cli called.
 * @param {Object} configs
 */
var stringifyConfigs = function stringifyConfigs(configs) {
  var str = '\'{';
  for (var key in configs) {
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
var runApp = function runApp(_ref11) {
  var device = _ref11.device,
      options = _ref11.options,
      configs = _ref11.configs;

  return new Promise(function (resolve, reject) {
    logger.info('Running app ...');
    var packageName = fs.readFileSync('app/src/main/AndroidManifest.xml', 'utf8').match(/package="(.+?)"/)[1];
    try {
      childprocess.execSync('adb -s ' + device + ' shell am start -n ' + packageName + '/.SplashActivity -d ' + stringifyConfigs({ Ws: configs.Ws }), {
        encoding: 'utf8'
      });
      logger.success('Success!');
    } catch (e) {
      reject(e);
    }
    resolve();
  });
};

/**
 * Build and run Android app on a connected emulator or device
 * @param {Object} options
 */
var runAndroid = function runAndroid(options) {

  shouldRunAndroid().then(function () {
    logger.info('npm run build');return utils.buildJS();
  }).then(function () {
    return copyJsbundleAssets(process.cwd(), 'dist', 'platforms/android/app/src/main/assets/dist');
  }).then(function () {
    return passOptions(options);
  }).then(prepareAndroid).then(resolveConfig).then(startHotReloadServer).then(registeFileWatcher).then(findAndroidDevice).then(chooseDevice).then(reverseDevice).then(buildApp).then(installApp).then(runApp).catch(function (err) {
    if (err) {
      logger.error('Error: ' + (err.stack || err));
      exit(0);
    }
  });
};

module.exports = runAndroid;