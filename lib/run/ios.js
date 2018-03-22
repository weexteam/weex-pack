'use strict';

var path = require('path');
var chalk = require('chalk');
var childprocess = require('child_process');
var inquirer = require('inquirer');
var copy = require('recursive-copy');
var fs = require('fs');
var utils = require('../utils');
var server = require('./server');
var chokidar = require('chokidar');
var WebSocket = require('ws');
var home = require('user-home');
var exit = require('exit');
var _ = require('underscore');
var logger = utils.logger;

var _require = require('../utils/config'),
    PlatformConfig = _require.PlatformConfig,
    iOSConfigResolver = _require.iOSConfigResolver,
    Platforms = _require.Platforms;

/**
 * compile jsbundle.
 */


var copyJsbundleAssets = function copyJsbundleAssets(dir, src, dist, quiet) {
  var options = {
    filter: ['*.js', '!*.web.js'],
    overwrite: true
  };
  if (!quiet) {
    logger.info('Move JSbundle to dist');
    return copy(path.join(dir, 'dist'), path.join(dir, 'platforms/ios/bundlejs/'), options).on(copy.events.COPY_FILE_START, function (copyOperation) {
      logger.verbose('Copying file ' + copyOperation.src + '...');
    }).on(copy.events.COPY_FILE_COMPLETE, function (copyOperation) {
      logger.verbose('Copied to ' + copyOperation.dest);
    }).on(copy.events.ERROR, function (error, copyOperation) {
      logger.error('Error:' + error.stack);
      logger.error('Unable to copy ' + copyOperation.dest);
    }).then(function (result) {
      logger.verbose('Move ' + result.length + ' files.');
    });
  }
  return copy(path.join(dir, 'dist'), path.join(dir, 'platforms/ios/bundlejs/'), options);
};

/**
 * pass options.
 * @param {Object} options
 */
var passOptions = function passOptions(options) {
  logger.verbose('passOptions ' + options + '.');
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

  logger.verbose('prepareIOS  with ' + options + '.');
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
      logger.info('Could not find Xcode project files in ios folder.');
      logger.info('Please make sure you have installed iOS Develop Environment and CocoaPods');
      reject();
    }
  });
};

/**
 * @desc start websocker server for hotreload
 * @param {Object} xcodeProject
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
var startHotReloadServer = function startHotReloadServer(_ref2) {
  var xcodeProject = _ref2.xcodeProject,
      options = _ref2.options,
      rootPath = _ref2.rootPath;


  return server.startWsServer(rootPath).then(function (_ref3) {
    var host = _ref3.host,
        ip = _ref3.ip,
        port = _ref3.port;

    var configs = _.extend({}, { Ws: host, ip: ip, port: port });
    return {
      xcodeProject: xcodeProject,
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
var registeFileWatcher = function registeFileWatcher(_ref4) {
  var xcodeProject = _ref4.xcodeProject,
      options = _ref4.options,
      rootPath = _ref4.rootPath,
      configs = _ref4.configs;

  var ws = new WebSocket(configs.Ws);
  // build js on watch mode.
  utils.buildJS('dev', true);

  // file watch task
  chokidar.watch(path.join(rootPath, 'dist'), { ignored: /\w*\.web\.js$/ }).on('change', function (event) {
    copyJsbundleAssets(rootPath, 'dist', 'platforms/ios/bundlejs/', true).then(function () {
      if (path.basename(event) === configs.WeexBundle) {
        logger.log('Wait Reload...');
        ws.send(JSON.stringify({ method: 'WXReloadBundle', params: 'http://' + configs.ip + ':' + configs.port + '/' + configs.WeexBundle }));
      }
    });
  });
  return {
    xcodeProject: xcodeProject,
    options: options,
    rootPath: rootPath,
    configs: configs
  };
};

/**
 * @desc resolve config in the android project
 * @param {Object} options
 * @param {String} rootPath
 */
var resolveConfig = function resolveConfig(_ref5) {
  var xcodeProject = _ref5.xcodeProject,
      options = _ref5.options,
      rootPath = _ref5.rootPath,
      configs = _ref5.configs;

  var iosConfig = new PlatformConfig(iOSConfigResolver, rootPath, Platforms.ios, configs);
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
 * Install dependency
 * @param {Object} xcode project
 * @param {Object} options
 */
var installDep = function installDep(_ref6) {
  var xcodeProject = _ref6.xcodeProject,
      options = _ref6.options,
      rootPath = _ref6.rootPath,
      configs = _ref6.configs;

  logger.info('pod update');
  return utils.exec('pod update').then(function () {
    return { xcodeProject: xcodeProject, options: options, rootPath: rootPath, configs: configs };
  });
};

/**
 * find ios devices
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Array} devices lists
 */
var findIOSDevice = function findIOSDevice(_ref7) {
  var xcodeProject = _ref7.xcodeProject,
      options = _ref7.options,
      rootPath = _ref7.rootPath,
      configs = _ref7.configs;

  return new Promise(function (resolve, reject) {
    var deviceInfo = '';
    try {
      deviceInfo = childprocess.execSync('xcrun instruments -s devices', { encoding: 'utf8' });
    } catch (e) {
      reject(e);
    }
    var devicesList = utils.parseIOSDevicesList(deviceInfo);
    resolve({ devicesList: devicesList, xcodeProject: xcodeProject, options: options, rootPath: rootPath, configs: configs });
  });
};

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Object} device
 */
var chooseDevice = function chooseDevice(_ref8) {
  var devicesList = _ref8.devicesList,
      xcodeProject = _ref8.xcodeProject,
      options = _ref8.options,
      rootPath = _ref8.rootPath,
      configs = _ref8.configs;

  return new Promise(function (resolve, reject) {
    if (devicesList && devicesList.length > 0) {
      var listNames = [new inquirer.Separator(' = devices = ')];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = devicesList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var device = _step.value;

          listNames.push({
            name: device.name + ' ios: ' + device.version + ' ' + (device.isSimulator ? '(Simulator)' : ''),
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
        resolve({ device: device, xcodeProject: xcodeProject, options: options, rootPath: rootPath, configs: configs });
      });
    } else {
      reject('No ios devices found.');
    }
  });
};

/**
 * build the iOS app on simulator or real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var buildApp = function buildApp(_ref9) {
  var device = _ref9.device,
      xcodeProject = _ref9.xcodeProject,
      options = _ref9.options,
      rootPath = _ref9.rootPath,
      configs = _ref9.configs;

  return new Promise(function (resolve, reject) {
    var projectInfo = '';
    try {
      projectInfo = utils.getIOSProjectInfo();
    } catch (e) {
      reject(e);
    }

    var scheme = projectInfo.project.schemes[0];

    if (device.isSimulator) {
      _buildOnSimulator({ scheme: scheme, device: device, xcodeProject: xcodeProject, options: options, resolve: resolve, reject: reject, rootPath: rootPath, configs: configs });
    } else {
      _buildOnRealDevice({ scheme: scheme, device: device, xcodeProject: xcodeProject, options: options, resolve: resolve, reject: reject, rootPath: rootPath, configs: configs });
    }
  });
};

/**
 * build the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var _buildOnSimulator = function _buildOnSimulator(_ref10) {
  var scheme = _ref10.scheme,
      device = _ref10.device,
      rootPath = _ref10.rootPath,
      xcodeProject = _ref10.xcodeProject,
      options = _ref10.options,
      configs = _ref10.configs,
      resolve = _ref10.resolve,
      reject = _ref10.reject;

  logger.info('Buiding project...');
  try {
    if (_.isEmpty(configs)) {
      reject(new Error('iOS config dir not detected.'));
    }
    childprocess.execSync('xcodebuild -' + (xcodeProject.isWorkspace ? 'workspace' : 'project') + ' ' + xcodeProject.name + ' -scheme ' + scheme + ' -configuration Debug -destination id=' + device.udid + ' -sdk iphonesimulator -derivedDataPath build clean build', { encoding: 'utf8' });
  } catch (e) {
    reject(e);
  }
  resolve({ device: device, xcodeProject: xcodeProject, options: options, configs: configs });
};

/**
 * build the iOS app on real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var _buildOnRealDevice = function _buildOnRealDevice(_ref11) {
  var scheme = _ref11.scheme,
      device = _ref11.device,
      xcodeProject = _ref11.xcodeProject,
      options = _ref11.options,
      configs = _ref11.configs,
      resolve = _ref11.resolve,
      reject = _ref11.reject;

  logger.info('Buiding project...');
  try {
    if (_.isEmpty(configs)) {
      reject(new Error('iOS config dir not detected.'));
    }
    childprocess.execSync('xcodebuild -' + (xcodeProject.isWorkspace ? 'workspace' : 'project') + ' ' + xcodeProject.name + ' -scheme ' + scheme + ' -configuration Debug -destination id=' + device.udid + ' clean build \'CODE_SIGN_IDENTITY=iPhone Distribution: Nanjing Taobao Software Co., Ltd\'', { encoding: 'utf8' });
  } catch (e) {
    reject(e);
  }
  resolve({ device: device, xcodeProject: xcodeProject, options: options, configs: configs });
};

/**
 * Run the iOS app on simulator or device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var runApp = function runApp(_ref12) {
  var device = _ref12.device,
      xcodeProject = _ref12.xcodeProject,
      options = _ref12.options,
      configs = _ref12.configs;

  return new Promise(function (resolve, reject) {
    if (device.isSimulator) {
      _runAppOnSimulator({ device: device, xcodeProject: xcodeProject, options: options, configs: configs, resolve: resolve, reject: reject });
    } else {
      // reject(`weex don't support run on real device, please use simulator on Xcode.`)
      _runAppOnDevice({ device: device, xcodeProject: xcodeProject, options: options, configs: configs, resolve: resolve, reject: reject });
    }
  });
};

/**
 * Run the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var _runAppOnSimulator = function _runAppOnSimulator(_ref13) {
  var device = _ref13.device,
      xcodeProject = _ref13.xcodeProject,
      options = _ref13.options,
      configs = _ref13.configs,
      resolve = _ref13.resolve,
      reject = _ref13.reject;

  var inferredSchemeName = path.basename(xcodeProject.name, path.extname(xcodeProject.name));
  var appPath = void 0;
  if (options.iosBuildPath && fs.existsSync(options.iosBuildPath)) {
    appPath = options.iosBuildPath;
  } else if (fs.existsSync(path.join(home, 'Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app'))) {
    appPath = path.join(home, 'Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app');
  } else if (fs.existsSync('build/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app')) {
    appPath = 'build/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app';
  } else {
    reject('You may had custome your XCode Deviced Data path, please use `--iosBuildPath` to set your path.');
    return;
  }
  logger.info('Run iOS Simulator..');
  try {
    childprocess.execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print:CFBundleIdentifier', path.join(appPath, 'Info.plist')], { encoding: 'utf8' }).trim();
  } catch (e) {
    reject(e);
    return;
  }
  var simctlInfo = '';
  try {
    simctlInfo = childprocess.execSync('xcrun simctl list --json devices', { encoding: 'utf8' });
  } catch (e) {
    reject(e);
    return;
  }
  simctlInfo = JSON.parse(simctlInfo);

  if (!simulatorIsAvailable(simctlInfo, device)) {
    reject('simulator is not available!');
    return;
  }

  logger.info('Launching ' + device.name + '...');

  try {
    childprocess.execSync('xcrun instruments -w ' + device.udid, { encoding: 'utf8', stdio: 'ignore' });
  } catch (e) {
    // instruments always fail with 255 because it expects more arguments,
    // but we want it to only launch the simulator
  }

  logger.info('Installing ' + appPath);

  try {
    childprocess.execSync('xcrun simctl install booted ' + appPath, { encoding: 'utf8' });
  } catch (e) {
    reject(e);
    return;
  }

  try {
    childprocess.execSync('xcrun simctl launch booted ' + configs.AppId, { encoding: 'utf8' });
  } catch (e) {
    reject(e);
    return;
  }
  logger.success('Success!');
  resolve();
};

/**
 * Run the iOS app on device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
var _runAppOnDevice = function _runAppOnDevice(_ref14) {
  var device = _ref14.device,
      xcodeProject = _ref14.xcodeProject,
      options = _ref14.options,
      resolve = _ref14.resolve,
      reject = _ref14.reject;

  // @TODO support run on real device
  var deviceId = device.udid;
  var appPath = void 0;
  if (options.iosBuildPath && fs.existsSync(options.iosBuildPath)) {
    appPath = options.iosBuildPath;
  } else if (fs.existsSync(path.join(home, 'Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app'))) {
    appPath = path.join(home, 'Library/Developer/Xcode/DerivedData/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app');
  } else if (fs.existsSync('build/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app')) {
    appPath = 'build/Build/Products/Debug-iphonesimulator/' + inferredSchemeName + '.app';
  } else {
    reject('You may had custome your XCode Deviced Data path, please use `--iosBuildPath` to set your path.');
    return;
  }
  logger.info('Run iOS Device..');
  try {
    logger.info(childprocess.execSync('../../node_modules/.bin/ios-deploy --justlaunch --debug --id ' + deviceId + ' --bundle ' + path.resolve(appPath), { encoding: 'utf8' }));
    logger.info('Success!');
  } catch (e) {
    reject(e);
  }
};

/**
 * check simulator is available
 * @param {JSON} info simulator list
 * @param {Object} device user choose one
 * @return {boolean} simulator is available
 */
var simulatorIsAvailable = function simulatorIsAvailable(info, device) {
  info = info.devices;
  var simList = void 0;
  // simList = info['iOS ' + device.version]
  for (var key in info) {
    if (key.indexOf('iOS') > -1) {
      simList = info[key];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = simList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var sim = _step2.value;

          if (sim.udid === device.udid) {
            return sim.availability === '(available)';
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }
};

/**
 * Run iOS app
 * @param {Object} options
 */
var runIOS = function runIOS(options) {
  logger.info('npm run build');
  utils.checkAndInstallForIosDeploy().then(utils.buildJS).then(function () {
    return copyJsbundleAssets(process.cwd(), 'dist', 'platforms/ios/bundlejs/');
  }).then(function () {
    return passOptions(options);
  }).then(prepareIOS).then(startHotReloadServer).then(registeFileWatcher).then(resolveConfig).then(installDep).then(findIOSDevice).then(chooseDevice).then(buildApp).then(runApp).catch(function (err) {
    if (err) {
      logger.error('Error:' + (err.stack || err));
      exit(0);
    }
  });
};

module.exports = runIOS;