'use strict';

var _arguments = arguments;
/**
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var tools = require('./utils/tools');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var lazyload = require('./lazyload');
var Q = require('q');
var platforms = require('./platforms');
var semver = require('semver');
var shell = require('shelljs');
var chalk = require('chalk');
var _ = require('underscore');
var npmUninstall = require('cordova-fetch').uninstall;
var platformMetadata = require('./platformMetadata');
var platformApi = require('./platformApiPoly');
var ora = require('ora');
var utils = require('../utils');
var logger = utils.logger;
var events = utils.events;

var _require = require('../plugin'),
    installForNewPlatform = _require.installForNewPlatform;

function remove(projectRoot, targets, opts) {
  if (!targets || !targets.length) {
    return Q.reject(new Error('No platform(s) specified. Please specify platform(s) to remove. See `' + tools.binname + ' platform list`.'));
  }
  return Q.when().then(function () {
    if (_.isArray(targets)) {
      targets.forEach(function (target) {
        shell.rm('-rf', path.join(projectRoot, 'platforms', target));
        removePlatformPluginsJson(projectRoot, target);
      });
    }
  }).then(function () {
    // Remove targets from platforms.json
    targets.forEach(function (target) {
      logger.verbose('Removing platform ' + target + ' from platforms.json file...');
      platformMetadata.remove(projectRoot, target);
    });
  }).then(function () {
    // Remove from node_modules if it exists and --fetch was used
    if (opts.fetch) {
      targets.forEach(function (target) {
        if (target in platforms) {
          target = 'cordova-' + target;
        }
        return npmUninstall(target, projectRoot, opts);
      });
    }
  }).then(function () {
    logger.info('Remove platform ' + targets + ' success');
  }).fail(function (error) {
    logger.error(error);
  });
}

function list(projectRoot, opts) {
  return Q.when().then(function () {
    return tools.getInstalledPlatformsWithVersions(projectRoot);
  }).then(function (platformMap) {
    var platformsText = [];
    for (var plat in platformMap) {
      platformsText.push(platformMap[plat] ? plat + ' ' + platformMap[plat] : plat);
    }
    platformsText = addDeprecatedInformationToPlatforms(platformsText);
    platformsText = platformsText.map(function (p) {
      return '- ' + p;
    });
    var results = 'Installed platforms:\n' + platformsText.sort().join('\n  ') + '\n';
    var available = Object.keys(platforms).filter(hostSupports);
    available = available.filter(function (p) {
      return !platformMap[p]; // Only those not already installed.
    });
    available = available.map(function (p) {
      return '- ' + p.concat(' ', platforms[p].version);
    });
    if (available.length > 0) {
      results += '\nAvailable platforms:\n' + available.sort().join('\n  ');
    }
    logger.log(results);
  }).fail(function (error) {
    logger.error(error);
  });
}

function update(projectRoot, targets, opts) {
  return addHelper('update', projectRoot, targets, opts);
}

function add(projectRoot, targets, opts) {
  return addHelper('add', projectRoot, targets, opts);
}

function addHelper(cmd, projectRoot, targets, opts) {
  var msg = void 0;
  var spinner = void 0;
  var cfg = {};
  if (!targets || !targets.length) {
    msg = 'No platform specified. Please specify a platform to ' + cmd + '. ' + 'See `' + tools.binname + ' platform list`.';
    return Q.reject(new Error(msg));
  }
  for (var i = 0; i < targets.length; i++) {
    if (!hostSupports(targets[i])) {
      msg = 'WARNING: Applications for platform ' + targets[i] + ' can not be built on this OS - ' + process.platform + '.';
      logger.info(msg);
    }
  }
  opts = opts || {};

  var platformsDir = path.join(projectRoot, 'platforms');

  shell.mkdir('-p', platformsDir);

  if (_.isArray(targets)) {
    targets.forEach(function (target) {
      var parts = target.split('@');
      var platform = parts[0];
      var spec = parts[1];
      return Q.when().then(function () {
        if (!(platform in platforms)) {
          spec = platform;
        }
        if (!spec) {
          spec = platforms[platform].version;
        }
        if (spec) {
          var maybeDir = tools.fixRelativePath(spec);
          if (tools.isDirectory(maybeDir)) {
            return getPlatformDetailsFromDir(maybeDir, platform);
          }
        }
        spinner = ora('Download ' + platform + '@' + spec + '...');
        spinner.start();
        return downloadPlatform(projectRoot, platform, spec, opts);
      }).then(function (platDetails) {
        spinner.stop();
        var platformPath = path.join(projectRoot, 'platforms', platform);
        var platformAlreadyAdded = fs.existsSync(platformPath);
        var options = {
          // We need to pass a platformDetails into update/create
          // since platformApiPoly needs to know something about
          // platform, it is going to create.
          platformDetails: platDetails
        };
        var promise = void 0;
        platform = platDetails.platform;

        if (cmd === 'add') {
          if (platformAlreadyAdded) {
            return inquirer.prompt([{
              type: 'confirm',
              message: 'Platform ' + platform + ' already added. Continue?',
              name: 'ok'
            }]).then(function (answers) {
              if (answers.ok) {
                logger.info((cmd === 'add' ? 'Adding' : 'Updating') + ' ' + platform + ' weexpack-' + platform + '@' + platDetails.version + ' ...');
                shell.rm('-rf', platformPath);
                promise = platformApi.createPlatform(platformPath, cfg, options, events);
                return promise.then(function () {
                  logger.success('Success!');
                  return platDetails;
                });
              } else {
                throw new Error('Platform ' + platform + ' already added.');
              }
            }).catch(logger.error);
          } else {
            promise = platformApi.createPlatform(platformPath, cfg, options, events);
            logger.info((cmd === 'add' ? 'Adding' : 'Updating') + ' ' + platform + ' weexpack-' + platform + '@' + platDetails.version + ' ...');
            return promise.then(function () {
              logger.success('Success!');
              return platDetails;
            });
          }
        } else if (cmd === 'update') {
          if (!platformAlreadyAdded) {
            throw new Error('Platform "' + platform + '" is not yet added. See `' + tools.binname + ' platform list`.');
          } else {
            promise = platformApi.updatePlatform(platformPath, options, events);
          }
          logger.info((cmd === 'add' ? 'Adding' : 'Updating') + ' ' + platform + ' weexpack-' + platform + '@' + platDetails.version + ' ...');
          return promise.then(function () {
            logger.success('Success!');
            return platDetails;
          });
        }
      }).then(function (platDetails) {
        var saveVersion = !spec || semver.validRange(spec, true);
        // Save platform@spec into platforms.json, where 'spec' is a version or a soure location. If a
        // source location was specified, we always save that. Otherwise we save the version that was
        // actually installed.
        var versionToSave = saveVersion ? platDetails.version : spec;
        logger.verbose('Saving ' + platform + '@' + versionToSave + ' into platforms.json');
        platformMetadata.save(projectRoot, platform, versionToSave);
        return platDetails;
      }).then(function (platDetails) {
        installForNewPlatform(platDetails.platform);
      }).fail(function (error) {
        logger.error(error.stack);
      });
    });
  }
}

// Downloads via npm or via git clone (tries both)
// Returns a Promise
function downloadPlatform(projectRoot, platform, version, opts) {
  var target = version ? platform + '@' + version : platform;
  return Q().then(function () {
    if (tools.isUrl(version)) {
      logger.info('git cloning: ' + version);
      var parts = version.split('#');
      var gitUrl = parts[0];
      var branchToCheckout = parts[1];
      return lazyload.git_clone(gitUrl, branchToCheckout).fail(function (err) {
        // If it looks like a url, but cannot be cloned, try handling it differently.
        // it's because it's a tarball of the form:
        //     - wp8@https://git-wip-us.apache.org/repos/asf?p=cordova-wp8.git;a=snapshot;h=3.7.0;sf=tgz
        //     - https://api.github.com/repos/msopenTech/cordova-browser/tarball/my-branch
        logger.verbose(err.message);
        logger.verbose('Cloning failed. Let\'s try handling it as a tarball');
        return lazyload.basedOnConfig(projectRoot, target, opts);
      });
    }
    return lazyload.basedOnConfig(projectRoot, target, opts);
  }).fail(function (error) {
    logger.error(error);
    var message = 'Failed to fetch platform ' + target + '\nProbably this is either a connection problem, or platform spec is incorrect.' + '\nCheck your connection and platform name/version/URL.' + '\n' + error;
    return Q.reject(new Error(message));
  }).then(function (libDir) {
    return getPlatformDetailsFromDir(libDir, platform);
  });
}

function platformFromName(name) {
  var platMatch = /^weexpack-([a-z0-9-]+)$/.exec(name);
  return platMatch && platMatch[1];
}
// Returns a Promise
// Gets platform details from a directory
function getPlatformDetailsFromDir(dir, platformIfKnown) {
  var libDir = path.resolve(dir);
  var platform = void 0;
  var version = void 0;
  try {
    var pkg = require(path.join(libDir, 'package'));
    platform = platformFromName(pkg.name);
    version = pkg.version;
  } catch (e) {
    // Older platforms didn't have package.json.
    platform = platformIfKnown || platformFromName(path.basename(dir));
    var verFile = fs.existsSync(path.join(libDir, 'VERSION')) ? path.join(libDir, 'VERSION') : fs.existsSync(path.join(libDir, 'CordovaLib', 'VERSION')) ? path.join(libDir, 'CordovaLib', 'VERSION') : null;
    if (verFile) {
      version = fs.readFileSync(verFile, 'UTF-8').trim();
    }
  }
  // if (!version || !platform || !platforms[platform]) {
  //     return Q.reject(new Error('The provided path does not seem to contain a ' +
  //         'Cordova platform: ' + libDir));
  // }
  return Q({
    libDir: libDir,
    platform: platform || platformIfKnown,
    version: version || '0.0.1'
  });
}

// function getVersionFromConfigFile(platform, cfg) {
//   if (!platform || (!(platform in platforms))) {
//     throw new Error('Invalid platform: ' + platform);
//   }
//   // Get appropriate version from config.xml
//   var engine = _.find(cfg.getEngines(), function (eng) {
//     return eng.name.toLowerCase() === platform.toLowerCase();
//   });
//   return engine && engine.spec;
// }

function addDeprecatedInformationToPlatforms(platformsList) {
  platformsList = platformsList.map(function (p) {
    var platformKey = p.split(' ')[0]; // Remove Version Information
    if (platforms[platformKey].deprecated) {
      p = p.concat(' ', '(deprecated)');
    }
    return p;
  });
  return platformsList;
}

// Used to prevent attempts of installing platforms that are not supported on
// the host OS. E.g. ios on linux.
function hostSupports(platform) {
  var p = platforms[platform] || {};
  var hostos = p.hostos || null;
  if (!hostos) return true;
  if (hostos.indexOf('*') >= 0) return true;
  if (hostos.indexOf(process.platform) >= 0) return true;
  return false;
}

// Remove <platform>.json file from plugins directory.
function removePlatformPluginsJson(projectRoot, target) {
  var pluginsJson = path.join(projectRoot, 'plugins', target + '.json');
  shell.rm('-f', pluginsJson);
}

var platform = function platform(command, targets, opts) {
  var msg = void 0;
  var projectRoot = void 0;
  try {
    projectRoot = tools.cdProjectRoot();
  } catch (e) {
    logger.error(e);
    return;
  }

  if (_arguments.length === 0) command = 'ls';

  if (targets) {
    if (!(targets instanceof Array)) targets = [targets];
    targets.forEach(function (t) {
      // Trim the @version part if it's there.
      var p = t.split('@')[0];
      // OK if it's one of known platform names.
      if (p in platforms) return;
      // Not a known platform name, check if its a real path.
      var pPath = path.resolve(t);
      if (fs.existsSync(pPath)) return;
      var msg = void 0;
      // If target looks like a url, we will try cloning it with git
      if (/[~:/\\.]/.test(t)) {
        return;
      } else {
        // Neither path, git-url nor platform name - throw.
        msg = 'Platform ' + t + ' not recognized as a core weex platform. See "' + tools.binname + ' platform list".\'';
      }
      throw new Error(msg);
    });
  } else if (command === 'add' || command === 'rm') {
    msg = 'You need to qualify `add` or `remove` with one or more platforms!';
    return Q.reject(new Error(msg));
  }
  opts = opts || {};
  opts.platforms = targets;
  switch (command) {
    case 'add':
      return add(projectRoot, targets, opts);
    case 'rm':
    case 'remove':
      return remove(projectRoot, targets, opts);
    case 'update':
    case 'up':
      return update(projectRoot, targets, opts);
    default:
      return list(projectRoot, opts);
  }
};

// Returns a promise.
module.exports = platform;