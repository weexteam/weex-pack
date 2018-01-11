const path = require('path');
const chalk = require('chalk');
const child_process = require('child_process');
const inquirer = require('inquirer');
const copy = require('recursive-copy');
const fs = require('fs');
const utils = require('../utils');
const server = require('./server');
const chokidar = require('chokidar');
const WebSocket = require('ws');
const _ = require('underscore');
const logger = require('weexpack-common').CordovaLogger.get();
const { 
  PlatformConfig, 
  iOSConfigResolver, 
  Platforms 
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
    return copy(path.join(dir, 'dist'), path.join(dir, 'platforms/ios/bundlejs/'), options)
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
  return copy(path.join(dir, 'dist'), path.join(dir, 'platforms/ios/bundlejs/'), options);
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
const prepareIOS = ({ options }) => {
  return new Promise((resolve, reject) => {
    const rootPath = process.cwd();
    if (!utils.checkIOS(rootPath)) {
      logger.info(chalk.red('  iOS project not found !'));
      logger.info(`  You should run ${chalk.blue('weex create')} or ${chalk.blue('weex platform add ios')} first`);
      reject();
    }
    // change working directory to ios
    process.chdir(path.join(rootPath, 'platforms/ios'));

    const xcodeProject = utils.findXcodeProject(process.cwd());

    if (xcodeProject) {
      logger.info(`\n=> ${chalk.blue.bold('start iOS app')}\n`);
      resolve({ xcodeProject, options, rootPath });
    }
    else {
      logger.info(`\n${chalk.red.bold('Could not find Xcode project files in ios folder')}`);
      logger.info(`\nPlease make sure you have installed iOS Develop Environment and CocoaPods`);
      logger.info(`\nSee ${chalk.cyan('http://alibaba.github.io/weex/doc/advanced/integrate-to-ios.html')}`);
      reject();
    }
  });
}

/**
 * @desc start websocker server for hotreload
 * @param {Object} xcodeProject
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
const startHotReloadServer = (
  {
    xcodeProject, 
    options, 
    rootPath
  }
) => {
  return server.startWsServer(rootPath).then(({host, ip, port}) => {
    configs = _.extend({}, {Ws:host, ip, port});
    return {
      xcodeProject,
      options,
      rootPath,
      configs
    }
  })
}

/**
 * @desc when the source file changed, tell native to reload the page.
 * @param {Object} options
 * @param {String} rootPath
 * @param {Object} configs
 */
const registeFileWatcher = (
  {
    xcodeProject,
    options,
    rootPath,
    configs
  }
) => {
  const ws = new WebSocket(configs.Ws);
  // build js on watch mode.
  utils.buildJS('dev', true)
  // file watch task
  chokidar.watch(path.join(rootPath, 'dist'), {ignored: /\w*\.web\.js$/})
  .on('change', (event) => {
    copyJsbundleAssets(rootPath, 'dist', 'platforms/ios/bundlejs/', true).then(() => {
      if (path.basename(event) === configs.WeexBundle) {
        logger.info(`\n=> ${chalk.blue.bold('Reloading page...')} \n`);
        ws.send(JSON.stringify({method: 'WXReloadBundle', params: `http://${configs.ip}:${configs.port}/${configs.WeexBundle}`}))
      }
    })
  });

  return {
    xcodeProject,
    options,
    rootPath,
    configs
  }
}

/**
 * @desc resolve config in the android project
 * @param {Object} options
 * @param {String} rootPath
 */
const resolveConfig = ({
  xcodeProject, 
  options, 
  rootPath,
  configs
}) => {
  const iosConfig = new PlatformConfig(iOSConfigResolver, rootPath, Platforms.ios, configs);
  return iosConfig.getConfig().then((configs) => {
    console.log(configs)
    iOSConfigResolver.resolve(configs);
    return {
      xcodeProject,
      options,
      rootPath,
      configs
    };
  });
}

/**
 * Install dependency
 * @param {Object} xcode project
 * @param {Object} options
 */
const installDep = ({ xcodeProject, options, rootPath, configs }) => {
  logger.info(`\n=> ${chalk.blue.bold('pod update')}\n`);
  return utils.exec('pod update').then(() => ({ xcodeProject, options, rootPath , configs}));
}

/**
 * find ios devices
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Array} devices lists
 */
const findIOSDevice = ({ xcodeProject, options, rootPath, configs }) => {
  return new Promise((resolve, reject) => {
    let deviceInfo = '';
    try {
      deviceInfo = child_process.execSync('xcrun instruments -s devices', { encoding: 'utf8' });
    }
    catch (e) {
      reject(e);
    }
    const devicesList = utils.parseIOSDevicesList(deviceInfo);
    resolve({ devicesList, xcodeProject, options, rootPath, configs });
  });
}

/**
 * Choose one device to run
 * @param {Array} devicesList: name, version, id, isSimulator
 * @param {Object} xcode project
 * @param {Object} options
 * @return {Object} device
 */
const chooseDevice = ({ devicesList, xcodeProject, options, rootPath, configs }) => {
  return new Promise((resolve, reject) => {
    if (devicesList && devicesList.length > 0) {
      const listNames = [new inquirer.Separator(' = devices = ')];
      for (const device of devicesList) {
        listNames.push(
          {
            name: `${device.name} ios: ${device.version}`,
            value: device
          }
        );
      }

      inquirer.prompt([
        {
          type: 'list',
          message: 'Choose one of the following devices',
          name: 'chooseDevice',
          choices: listNames
        }
      ])
      .then((answers) => {
        const device = answers.chooseDevice;
        resolve({ device, xcodeProject, options, rootPath, configs });
      });
    }
    else {
      reject('No ios devices found.');
    }
  });
}

/**
 * build the iOS app on simulator or real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const buildApp = ({ device, xcodeProject, options, rootPath, configs }) => {
  return new Promise((resolve, reject) => {
    let projectInfo = '';
    try {
      projectInfo = utils.getIOSProjectInfo();
    }
    catch (e) {
      reject(e);
    }

    const scheme = projectInfo.project.schemes[0];

    if (device.isSimulator) {
      _buildOnSimulator({ scheme, device, xcodeProject, options, resolve, reject, rootPath, configs });
    }
    else {
      _buildOnRealDevice({ scheme, device, xcodeProject, options, resolve, reject, rootPath, configs });
    }
  });
}

/**
 * build the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _buildOnSimulator = ({ scheme, device, rootPath, xcodeProject, options, configs, resolve, reject }) => {
  logger.info(`\n=> ${chalk.blue.bold('Buiding project...')}\n`);
  let buildInfo = '';
  try {
    if (_.isEmpty(configs)) {
      reject(new Error('iOS config dir not detected.'));
    }
    buildInfo = child_process.execSync(`xcodebuild -${xcodeProject.isWorkspace ? 'workspace' : 'project'} ${xcodeProject.name} -scheme ${scheme} -configuration Debug -destination id=${device.udid} -sdk iphonesimulator -derivedDataPath build clean build`, { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
  }
  resolve({ device, xcodeProject, options, configs });
}

/**
 * build the iOS app on real device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _buildOnRealDevice = ({ scheme, device, xcodeProject, options, configs, resolve, reject, rootPath }) => {
  try {
    resolve({ device, xcodeProject, options, rootPath });
  }
  catch (e) {
    reject(e);
  }
  resolve({ device, xcodeProject, options, configs });
}

/**
 * Run the iOS app on simulator or device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const runApp = ({ device, xcodeProject, options, configs }) => {
  return new Promise((resolve, reject) => {
    if (device.isSimulator) {
      _runAppOnSimulator({ device, xcodeProject, options, configs, resolve, reject });
    }
    else {
      _runAppOnDevice({ device, xcodeProject, options, configs, resolve, reject });
    }
  });
}

/**
 * Run the iOS app on simulator
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _runAppOnSimulator = ({ device, xcodeProject, options, configs, resolve, reject }) => {
  logger.info(`\n=> ${chalk.blue.bold('Run iOS Simulator..')}\n`);
  const inferredSchemeName = path.basename(xcodeProject.name, path.extname(xcodeProject.name));
  const appPath = `build/Build/Products/Debug-iphonesimulator/${inferredSchemeName}.app`;
  const bundleID = child_process.execFileSync(
    '/usr/libexec/PlistBuddy',
    ['-c', 'Print:CFBundleIdentifier', path.join(appPath, 'Info.plist')],
    { encoding: 'utf8' }
  ).trim();
  // const bundleID = configs.AppId;
  let simctlInfo = '';
  try {
    simctlInfo = child_process.execSync('xcrun simctl list --json devices', { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
  }
  simctlInfo = JSON.parse(simctlInfo);

  if (!simulatorIsAvailable(simctlInfo, device)) {
    reject('simulator is not available!');
  }

  logger.info(`Launching ${device.name}...`);

  try {
    child_process.execSync(`xcrun instruments -w ${device.udid}`, { encoding: 'utf8' });
  }
  catch (e) {
    // instruments always fail with 255 because it expects more arguments,
    // but we want it to only launch the simulator
  }

  logger.info(`Installing ${appPath}`);

  try {
    child_process.execSync(`xcrun simctl install booted ${appPath}`, { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
  }

  try {
    child_process.execSync(`xcrun simctl launch booted ${configs.AppId}`, { encoding: 'utf8' });
  }
  catch (e) {
    reject(e);
  }
  logger.info('\nSuccess!');
  resolve();
}

/**
 * check simulator is available
 * @param {JSON} info simulator list
 * @param {Object} device user choose one
 * @return {boolean} simulator is available
 */
const simulatorIsAvailable = (info, device) => {
  info = info.devices;
  let simList;
  // simList = info['iOS ' + device.version]
  for (const key in info) {
    if (key.indexOf('iOS') > -1) {
      simList = info[key];
      for (const sim of simList) {
        if (sim.udid === device.udid) {
          return sim.availability === '(available)';
        }
      }
    }
  }
}

/**
 * Run the iOS app on device
 * @param {Object} device
 * @param {Object} xcode project
 * @param {Object} options
 */
const _runAppOnDevice = ({ device, xcodeProject, options, resolve, reject }) => {
  // @TODO support run on real device
  const appPath = `build/Debug-iphoneos/WeexDemo.app`;
  const deviceId = device.udid;
  try {
    if (!fs.existsSync(appPath)) {
      logger.info('building...');
      child_process.execSync(path.join(__dirname, '../build/lib/cocoapods-build') + ' . Debug', { encoding: 'utf8' });
    }

    logger.info(child_process.execSync(`../../node_modules/.bin/ios-deploy --justlaunch --debug --id ${deviceId} --bundle ${path.resolve(appPath)}`, { encoding: 'utf8' }));
  }
  catch (e) {
    reject(e);
  }
  logger.info('Success!');
  // reject('Weex-Pack don\'t support run on real device. see you next version!')
}

/**
 * Run iOS app
 * @param {Object} options
 */
const runIOS = (options) => {
  logger.info(`\n=> ${chalk.blue.bold('npm run build')}`);
  utils.checkAndInstallForIosDeploy()
    .then(utils.buildJS)
    .then(() => copyJsbundleAssets(process.cwd(), 'dist', 'platforms/ios/bundlejs/'))
    .then(() => passOptions(options))
    .then(prepareIOS)
    .then(startHotReloadServer)
    .then(registeFileWatcher)
    .then(resolveConfig)
    .then(installDep)
    .then(findIOSDevice)
    .then(chooseDevice)
    .then(buildApp)
    .then(runApp)
    .catch((err) => {
      if (err) {
        logger.error(chalk.red('Error:', err.stack));
      }
    });
}

module.exports = runIOS;
