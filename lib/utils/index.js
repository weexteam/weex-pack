'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var os = require('os');
var npm = require('npm');
var mkdirp = require('mkdirp');
var chalk = require('chalk');
var _ = require('underscore');
var output = require('./output');
var validator = require('./validator');
var log = require('./logger');
var logger = log.logger;
var gituser = require('./gituser');
var ask = require('./ask');
var utils = {
  copyAndReplace: function copyAndReplace(src, dest, replacements) {
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
    } else {
      var content = fs.readFileSync(src, 'utf8');
      Object.keys(replacements).forEach(function (regex) {
        content = content.replace(new RegExp(regex, 'gm'), replacements[regex]);
      });
      fs.writeFileSync(dest, content);
    }
  },


  /**
   * Find xcode project in particular directory
   * @param {String} directory
   * @return {Object} project info
   */
  findXcodeProject: function findXcodeProject(dir) {
    if (!fs.existsSync(dir)) {
      return false;
    }
    var files = fs.readdirSync(dir);
    var sortedFiles = files.sort();
    for (var i = sortedFiles.length - 1; i >= 0; i--) {
      var fileName = files[i];
      var ext = path.extname(fileName);

      if (ext === '.xcworkspace') {
        return {
          name: fileName,
          isWorkspace: true
        };
      }
      if (ext === '.xcodeproj') {
        return {
          name: fileName,
          isWorkspace: false
        };
      }
    }

    return null;
  },
  parseIOSDevicesList: function parseIOSDevicesList(text) {
    var devices = [];
    var REG_DEVICE = /(.*?) \((.*?)\) \[(.*?)]/;

    var lines = text.split('\n');
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var line = _step.value;

        if (line.indexOf('Watch') >= 0 || line.indexOf('TV') >= 0 || line.indexOf('iPad') >= 0) {
          continue;
        }
        var device = line.match(REG_DEVICE);
        if (device !== null) {
          var name = device[1];
          var version = device[2];
          var udid = device[3];
          var isSimulator = line.indexOf('Simulator') >= 0 || udid.indexOf('-') >= 0;
          devices.push({ name: name, version: version, udid: udid, isSimulator: isSimulator });
        }
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

    return devices;
  },
  parseDevicesResult: function parseDevicesResult(result) {
    if (!result) {
      return [];
    }

    var devices = [];
    var lines = result.trim().split(/\r?\n/);

    for (var i = 0; i < lines.length; i++) {
      var words = lines[i].split(/[ ,\t]+/).filter(function (w) {
        return w !== '';
      });

      if (words[1] === 'device') {
        devices.push(words[0]);
      }
    }
    return devices;
  },
  exec: function exec(command, quiet) {
    return new Promise(function (resolve, reject) {
      try {
        var child = childProcess.exec(command, { encoding: 'utf8', wraning: false, maxBuffer: 1024 * 1024 }, function (error, stdout, stderr) {
          if (error) {
            logger.warn('Command run error, please check if there has the same issue here: https://github.com/weexteam/weex-toolkit/issues/337');
            reject(error);
          } else {
            resolve();
          }
        });
        if (!quiet) {
          child.stdout.pipe(process.stdout);
        }
        child.stderr.pipe(process.stderr);
      } catch (e) {
        logger.error('execute command failed :', command);
        reject(e);
      }
    });
  },
  buildJS: function buildJS() {
    var cmd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'build';
    var quiet = arguments[1];

    return utils.exec('npm run ' + cmd, quiet);
  },
  getIOSProjectInfo: function getIOSProjectInfo() {
    var projectInfoText = childProcess.execSync('xcodebuild  -list', { encoding: 'utf8' });
    var splits = projectInfoText.split(/Targets:|Build Configurations:|Schemes:/);
    var projectInfo = {};
    projectInfo.name = splits[0].match(/Information about project "([^"]+?)"/)[1];
    projectInfo.targets = splits[1] ? splits[1].split('\n').filter(function (e) {
      return !!e.trim();
    }).map(function (e) {
      return e.trim();
    }) : [];
    projectInfo.configurations = splits[2] ? splits[2].split('\n').filter(function (e, i) {
      return !!e.trim() && i < 3;
    }).map(function (e) {
      return e.trim();
    }) : [];
    projectInfo.schemes = splits[3] ? splits[3].split('\n').filter(function (e) {
      return !!e.trim();
    }).map(function (e) {
      return e.trim();
    }) : [];
    return { project: projectInfo };
  },
  checkAndInstallForIosDeploy: function checkAndInstallForIosDeploy() {
    var hasIosDeploy = fs.existsSync('./node_modules/.bin/ios-deploy');
    if (!hasIosDeploy) {
      var args = '';
      if (process.platform === 'win32') {
        logger.log('run ios unsupported on windows');
        process.exit(1);
      }
      if (os.release() >= '15.0.0') {
        args = ' --unsafe-perm=true --allow-root';
      }
      return this.exec(path.join(__dirname, '/installIosDeploy.sh', args));
    } else {
      return Promise.resolve();
    }
  },
  dashToCamel: function dashToCamel(str) {
    return str.replace(/(-[a-z])/g, function ($1) {
      return $1.toUpperCase().replace('-', '');
    });
  },


  isIOSProject: function isIOSProject(dir) {
    var result = this.findXcodeProject(dir);
    return result;
  },

  isAndroidProject: function isAndroidProject(dir) {
    if (fs.existsSync(path.join(dir, 'build.gradle'))) {
      return true;
    }
  },

  isNewVersionPlugin: function isNewVersionPlugin(pluginName, version, callback) {
    var trynum = 0;
    npm.load(function () {
      var load = function load(npmName) {
        npm.commands.info([npmName + '@' + version], true, function (error, result) {
          var prefix = void 0;
          if (error && trynum === 0) {
            trynum++;
            if (npmName === 'weex-gcanvas') {
              prefix = 'weex-plugin--';
            } else {
              prefix = 'weex-plugin-';
            }
            load(prefix + npmName);
          } else if (error && trynum !== 0) {
            throw new Error(error);
          } else {
            var packages = result[version];
            if (packages.android || packages.ios || packages.web) {
              var supports = [];
              if (packages.android) {
                supports.push('Android');
              }
              if (packages.ios) {
                supports.push('iOS');
              }
              if (packages.web) {
                supports.push('Web');
              }
              logger.log(chalk.green('This plugin support for ' + supports.join(',') + ' platforms.'));
              callback({
                ios: packages.ios,
                android: packages.android,
                web: packages.web,
                version: packages.version,
                name: packages.name,
                weexpack: packages.weexpack,
                pluginDependencies: packages.pluginDependencies
              });
            } else {
              callback(false);
            }
          }
        });
      };
      load(pluginName);
    });
  },

  writePluginFile: function writePluginFile(root, path, config) {
    if (!fs.existsSync(root)) {
      mkdirp(root, function (err) {
        if (err) {
          logger.log(err);
        }
      });
    }
    if (!fs.existsSync(path)) {
      fs.open(path, 'w+', '0666', function (err, fd) {
        if (err) {
          logger.error(err);
        }
        fs.writeFileSync(path, JSON.stringify(config, null, 2));
      });
    } else {
      fs.writeFileSync(path, JSON.stringify(config, null, 2));
    }
  },

  updatePluginConfigs: function updatePluginConfigs(configs, name, option, platform) {
    var plugins = Object.assign({}, configs);
    var len = plugins[platform] && plugins[platform].length;
    for (var i = len - 1; i >= 0; i--) {
      if (name && plugins[platform][i].name === name) {
        if (!_.isEmpty(option)) {
          plugins[platform].splice(i, 1, option[platform]);
        } else {
          plugins[platform].splice(i, 1);
        }
        return plugins;
      }
    }
    if (option[platform]) {
      plugins[platform].push(option[platform]);
    }
    return plugins;
  },

  writeAndroidPluginFile: function writeAndroidPluginFile(root, path, config) {
    if (!fs.existsSync(root)) {
      mkdirp(root, function (err) {
        if (err) {
          logger.error(err);
        }
      });
    }
    if (!fs.existsSync(path)) {
      fs.open(path, 'w+', '0666', function (err, fd) {
        if (err) {
          logger.error(err);
        }
        fs.writeFileSync(path, JSON.stringify(config, null, 2));
      });
    } else {
      fs.writeFileSync(path, JSON.stringify(config, null, 2));
    }
  },

  updateAndroidPluginConfigs: function updateAndroidPluginConfigs(configs, name, option) {
    var plugins = configs.slice(0);
    var len = plugins && plugins.length;
    if (!option['dependency']) {
      option['dependency'] = option.groupId + ':' + option.name + ':' + option.version;
    }
    for (var i = len - 1; i >= 0; i--) {
      var plugin = plugins[i];
      if (typeof plugin['dependency'] === 'undefined') {
        plugin['dependency'] = plugin.groupId + ':' + plugin.name + ':' + plugin.version;
      }
      if (name && plugin.name === name) {
        if (option) {
          plugins.splice(i, 1, option);
        } else {
          plugins.splice(i, 1);
        }
        return plugins;
      }
    }
    if (option) {
      plugins.push(option);
    }
    return plugins;
  },

  installNpmPackage: function installNpmPackage() {
    return utils.exec('npm install', false);
  },
  isRootDir: function isRootDir(dir) {
    if (fs.existsSync(path.join(dir, 'platforms'))) {
      if (fs.existsSync(path.join(dir, 'web'))) {
        // For sure is.
        if (fs.existsSync(path.join(dir, 'config.xml'))) {
          return 2;
        } else {
          return 1;
        }
      }
    }
    return 0;
  },
  listPlatforms: function listPlatforms(projectDir) {
    var platforms = require('../platform/platforms');
    var platformsDir = path.join(projectDir, 'platforms');
    if (!fs.existsSync(platformsDir)) {
      return [];
    }
    var subdirs = fs.readdirSync(platformsDir);
    return subdirs.filter(function (p) {
      return Object.keys(platforms).indexOf(p) > -1;
    });
  },


  // Runs up the directory chain looking for a .cordova directory.
  // IF it is found we are in a Cordova project.
  // Omit argument to use CWD.
  isCordova: function isCordova(dir) {
    if (!dir) {
      // Prefer PWD over cwd so that symlinked dirs within your PWD work correctly (CB-5687).
      var pwd = process.env.PWD;
      var cwd = process.cwd();
      if (pwd && pwd !== cwd && typeof pwd !== 'undefined') {
        return this.isCordova(pwd) || this.isCordova(cwd);
      }
      return this.isCordova(cwd);
    }
    var bestReturnValueSoFar = false;
    for (var i = 0; i < 1000; ++i) {
      var result = this.isRootDir(dir);
      if (result === 2) {
        return dir;
      }
      if (result === 1) {
        bestReturnValueSoFar = dir;
      }
      var parentDir = path.normalize(path.join(dir, '..'));
      // Detect fs root.
      if (parentDir === dir) {
        return bestReturnValueSoFar;
      }
      dir = parentDir;
    }
    logger.error('Hit an unhandled case in util.isCordova');
    return false;
  },
  fill: function fill(name, length) {
    var space = length - name.length;
    if (space > 0) {
      while (space--) {
        name += ' ';
      }
    }
    return name;
  }
};

module.exports = Object.assign(utils, output, validator, log, gituser, ask);