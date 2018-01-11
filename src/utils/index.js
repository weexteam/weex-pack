const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const os = require('os');
const npm = require('npm');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const _ = require('underscore')
const output = require('./output');
const validator = require('./validator');

const utils = {
  copyAndReplace (src, dest, replacements) {
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
    }
    else {
      let content = fs.readFileSync(src, 'utf8');
      Object.keys(replacements).forEach(regex => {
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
  findXcodeProject (dir) {
    if (!fs.existsSync(dir)) {
      return false;
    }
    const files = fs.readdirSync(dir);
    const sortedFiles = files.sort();
    for (let i = sortedFiles.length - 1; i >= 0; i--) {
      const fileName = files[i];
      const ext = path.extname(fileName);

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

  parseIOSDevicesList (text) {
    const devices = [];
    const REG_DEVICE = /(.*?) \((.*?)\) \[(.*?)]/;

    const lines = text.split('\n');
    for (const line of lines) {
      if (line.indexOf('Watch') >= 0 || line.indexOf('TV') >= 0 || line.indexOf('iPad') >= 0) {
        continue;
      }
      const device = line.match(REG_DEVICE);
      if (device !== null) {
        const name = device[1];
        const version = device[2];
        const udid = device[3];
        const isSimulator = line.indexOf('Simulator') >= 0 || udid.indexOf('-') >= 0;
        devices.push({ name, version, udid, isSimulator });
      }
    }

    return devices;
  },
  parseDevicesResult (result) {
    if (!result) {
      return [];
    }

    const devices = [];
    const lines = result.trim().split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const words = lines[i].split(/[ ,\t]+/).filter((w) => w !== '');

      if (words[1] === 'device') {
        devices.push(words[0]);
      }
    }
    return devices;
  },
  exec (command, quiet) {
    return new Promise((resolve, reject) => {
      try {
        const child = child_process.exec(command, { encoding: 'utf8', wraning: false}, function () {
          resolve();
        });
        if (!quiet) {
          child.stdout.pipe(process.stdout);
        }
        child.stderr.pipe(process.stderr);
      }
      catch (e) {
        console.error('execute command failed :', command);
        reject(e);
      }
    });
  },
  buildJS (cmd = 'build', quiet) {
    return utils.exec('npm run ' + cmd, quiet);
  },
  getIOSProjectInfo () {
    const projectInfoText = child_process.execSync('xcodebuild  -list', { encoding: 'utf8' });
    const splits = projectInfoText.split(/Targets:|Build Configurations:|Schemes:/);
    const projectInfo = {};
    projectInfo.name = splits[0].match(/Information about project "([^"]+?)"/)[1];
    projectInfo.targets = splits[1] ? splits[1].split('\n').filter(e => !!e.trim()).map(e => e.trim()) : [];
    projectInfo.configurations = splits[2] ? splits[2].split('\n').filter((e, i) => !!e.trim() && i < 3).map(e => e.trim()) : [];
    projectInfo.schemes = splits[3] ? splits[3].split('\n').filter(e => !!e.trim()).map(e => e.trim()) : [];
    return { project: projectInfo };
  },
  checkAndInstallForIosDeploy () {
    const hasIosDeploy = fs.existsSync('./node_modules/.bin/ios-deploy');
    if (!hasIosDeploy) {
      let args = '';
      if (process.platform === 'win32') {
        console.log('run ios unsupported on windows');
        process.exit(1);
      }
      if (os.release() >= '15.0.0') {
        args = ' --unsafe-perm=true --allow-root';
      }
      return this.exec(__dirname + '/installIosDeploy.sh' + args);
    }
    else {
      return Promise.resolve();
    }
  },
  xcopy (source, dest) {
    if (process.platform === 'win32') {
      cmd;
    }
  },
  dashToCamel (str) {
    return str.replace(/(\-[a-z])/g, function ($1) { return $1.toUpperCase().replace('-', ''); });
  },

  isIOSProject: function (dir) {
    const result = this.findXcodeProject(dir);
    return result;
  },

  isAndroidProject: function (dir) {
    if (fs.existsSync(path.join(dir, 'build.gradle'))) {
      return true;
    }
  },

  isNewVersionPlugin: function (pluginName, version, callback) {
    let trynum = 0;
    npm.load(function () {
      const load = function (npmName) {
        npm.commands.info([npmName + '@' + version], true, function (error, result) {
          if (error && trynum == 0) {
            trynum++;
            if (npmName == 'weex-gcanvas') {
              var prefix = 'weex-plugin--';
            }
            else {
              var prefix = 'weex-plugin-';
            }
            load(prefix + npmName);
          }
          else if (error && trynum !== 0) {
            throw new Error(error);
          }
          else {
            const packages = result[version];
            if (packages.android || packages.ios || packages.web) {
              let supports = [];
              if (packages.android) {
                supports.push('Android')
              }
              if (packages.ios) {
                supports.push('iOS')
              }
              if (packages.web) {
                supports.push('Web')
              }
              console.log(chalk.green(`This plugin support for ${supports.join(',')} platforms.`))
              callback({
                ios: packages.ios,
                android: packages.android,
                web: packages.web,
                version: packages.version,
                name: packages.name,
                weexpack: packages.weexpack,
                pluginDependencies: packages.pluginDependencies
              });
            }
            else {
              callback(false);
            }
          }
        });
      };
      load(pluginName);
    });
  },

  writePluginFile: function (root, path, config) {
    if (!fs.existsSync(root)){
      mkdirp(root, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
    if (!fs.existsSync(path)) {
      fs.open(path,'w+','0666', (err, fd) => {
        fs.writeFileSync(path, JSON.stringify(config, null, 2));
      });
    }
    else {
      fs.writeFileSync(path, JSON.stringify(config, null, 2));
    }
  },

  updatePluginConfigs: function (configs, name, option, platform) {
    let plugins = Object.assign({}, configs);
    const len = plugins[platform] && plugins[platform].length;
    for (let i =  len - 1; i >= 0; i --) {
      if (name && plugins[platform][i].name === name) {
        if (!_.isEmpty(option)) {
          plugins[platform].splice(i,1,option[platform])
        }
        else {
          plugins[platform].splice(i,1);
        }
        return plugins;
      }
    }
    if (option[platform]) {
      plugins[platform].push(option[platform]);
    }
    return plugins;
  },

  writeAndroidPluginFile: function (root, path, config) {
    if (!fs.existsSync(root)){
      mkdirp(root, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
    if (!fs.existsSync(path)) {
      fs.open(path,'w+','0666', (err, fd) => {
        fs.writeFileSync(path, JSON.stringify(config, null, 2));
      });
    }
    else {
      fs.writeFileSync(path, JSON.stringify(config, null, 2));
    }
  },

  updateAndroidPluginConfigs: function (configs, name, option) {
    let plugins = configs.slice(0);
    const len = plugins && plugins.length;
    for (let i =  len - 1; i >= 0; i --) {
      let plugin = plugins[i];
      if (!plugin['dependency']) {
        plugin['dependency'] = `${plugin.groupId}:${plugin.name}:${plugin.version}`
      }
      if (name && plugin.name === name) {
        if (option) {
          plugins.splice(i,1,option)
        }
        else {
          plugins.splice(i,1)
        }
        return plugins;
      }
    }
    if (option) {
      plugins.push(option);
    }
    return plugins;
  },

  installNpmPackage () {
    return utils.exec('npm install', false)
  },

  isRootDir(dir) {
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

  listPlatforms(project_dir) {
    const core_platforms = require('../platform/platforms');
    const platforms_dir = path.join(project_dir, 'platforms');
    if ( !fs.existsSync(platforms_dir)) {
        return [];
    }
    const subdirs = fs.readdirSync(platforms_dir);
    return subdirs.filter(function(p) {
        return Object.keys(core_platforms).indexOf(p) > -1;
    });
  },

  // Runs up the directory chain looking for a .cordova directory.
  // IF it is found we are in a Cordova project.
  // Omit argument to use CWD.
  isCordova(dir) {
    if (!dir) {
        // Prefer PWD over cwd so that symlinked dirs within your PWD work correctly (CB-5687).
        var pwd = process.env.PWD;
        var cwd = process.cwd();
        if (pwd && pwd != cwd && pwd != 'undefined') {
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
        if (parentDir == dir) {
            return bestReturnValueSoFar;
        }
        dir = parentDir;
    }
    console.error('Hit an unhandled case in util.isCordova');
    return false;
  }

};

module.exports = Object.assign(utils, output, validator);
