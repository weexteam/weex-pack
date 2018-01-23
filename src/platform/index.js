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

const tools = require('./utils/tools');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const lazyload = require('./lazyload');
const Q = require('q');
const platforms = require('./platforms');
const semver = require('semver');
const shell = require('shelljs');
const chalk = require('chalk');
const _ = require('underscore');
const npmUninstall = require('cordova-fetch').uninstall;
const platformMetadata = require('./platformMetadata');
const platformApi = require('./platformApiPoly');
const utils = require('../utils');
const logger = utils.logger;
const events = utils.events;

const {
  installForNewPlatform
} = require('../plugin');


function remove (projectRoot, targets, opts) {
  if (!targets || !targets.length) {
    return Q.reject(new Error('No platform(s) specified. Please specify platform(s) to remove. See `' + tools.binname + ' platform list`.'));
  }
  return Q.when()
  .then(() => {
    if (_.isArray(targets)) {
      targets.forEach((target) => {
        shell.rm('-rf', path.join(projectRoot, 'platforms', target));
        removePlatformPluginsJson(projectRoot, target);
      });
    }
  })
  .then(function () {
    // Remove targets from platforms.json
    targets.forEach(function (target) {
      logger.verbose('Removing platform ' + target + ' from platforms.json file...');
      platformMetadata.remove(projectRoot, target);
    });
  })
  .then(function () {
    // Remove from node_modules if it exists and --fetch was used
    if (opts.fetch) {
      targets.forEach(function (target) {
        if (target in platforms) {
          target = 'cordova-' + target;
        }
        return npmUninstall(target, projectRoot, opts);
      });
    }
  })
  .then(function () {
    logger.info('Remove platform ' + targets + ' success');
  })
  .fail(error => {
    logger.error(error);
  });
}

function list (projectRoot, opts) {
  return Q.when()
  .then(function () {
    return tools.getInstalledPlatformsWithVersions(projectRoot);
  })
  .then(function (platformMap) {
    let platformsText = [];
    for (const plat in platformMap) {
      platformsText.push(platformMap[plat] ? plat + ' ' + platformMap[plat] : plat);
    }
    platformsText = addDeprecatedInformationToPlatforms(platformsText);
    platformsText = platformsText.map(p => `- ${p}`)
    let results = 'Installed platforms:\n' + platformsText.sort().join('\n  ') + '\n';
    let available = Object.keys(platforms).filter(hostSupports);
    available = available.filter(function (p) {
      return !platformMap[p]; // Only those not already installed.
    });
    available = available.map(function (p) {
      return `- ${p.concat(' ', platforms[p].version)}`;
    });
    if (available.length > 0) {
      results += '\nAvailable platforms:\n' + available.sort().join('\n  ');
    }
    logger.log(results);
  })
  .fail(error => {
    logger.error(error);
  });
}

function update (projectRoot, targets, opts) {
  return addHelper('update', projectRoot, targets, opts);
}

function add (projectRoot, targets, opts) {
  return addHelper('add', projectRoot, targets, opts);
}

function addHelper (cmd, projectRoot, targets, opts) {
  let msg;
  const cfg = {};
  if (!targets || !targets.length) {
    msg = 'No platform specified. Please specify a platform to ' + cmd + '. ' + 'See `' + tools.binname + ' platform list`.';
    return Q.reject(new Error(msg));
  }
  for (let i = 0; i < targets.length; i++) {
    if (!hostSupports(targets[i])) {
      msg = 'WARNING: Applications for platform ' + targets[i] + ' can not be built on this OS - ' + process.platform + '.';
      logger.info(msg);
    }
  }
  opts = opts || {};

  const platformsDir = path.join(projectRoot, 'platforms');

  shell.mkdir('-p', platformsDir);

  if (_.isArray(targets)) {
    targets.forEach(target => {
      const parts = target.split('@');
      let platform = parts[0];
      let spec = parts[1];
      return Q.when().then(() => {
        if (!(platform in platforms)) {
          spec = platform;
        }
        if (!spec) {
          spec = platforms[platform].version;
        }
        if (spec) {
          const maybeDir = tools.fixRelativePath(spec);
          if (tools.isDirectory(maybeDir)) {
            return getPlatformDetailsFromDir(maybeDir, platform);
          }
        }
        return downloadPlatform(projectRoot, platform, spec, opts);
      })
      .then((platDetails) => {
        const platformPath = path.join(projectRoot, 'platforms', platform);
        const platformAlreadyAdded = fs.existsSync(platformPath);
        const options = {
          // We need to pass a platformDetails into update/create
          // since platformApiPoly needs to know something about
          // platform, it is going to create.
          platformDetails: platDetails
        };
        let promise;
        platform = platDetails.platform;

        if (cmd === 'add') {
          if (platformAlreadyAdded) {
            return inquirer.prompt([{
              type: 'confirm',
              message: `Platform ${platform} already added. Continue?`,
              name: 'ok'
            }]).then(answers => {
              if (answers.ok) {
                logger.info( `${(cmd === 'add' ? 'Adding' : 'Updating')} ${platform} weexpack-${platform}@${platDetails.version} ...`);
                shell.rm('-rf', platformPath);
                promise = platformApi.createPlatform(platformPath, cfg, options, events);
                return promise.then(() => {
                  logger.success('Success!');
                  return platDetails;
                });
              }
              else {
                throw new Error(`Platform ${platform} already added.`);
              }
            }).catch(logger.error);
          }
          else {
            promise = platformApi.createPlatform(platformPath, cfg, options, events);
            logger.info( `${(cmd === 'add' ? 'Adding' : 'Updating')} ${platform} weexpack-${platform}@${platDetails.version} ...`);
            return promise.then(() => {
              logger.success('Success!');
              return platDetails;
            });
          }
        }
        else if (cmd === 'update') {
          if (!platformAlreadyAdded) {
            throw new Error('Platform "' + platform + '" is not yet added. See `' + tools.binname + ' platform list`.');
          }
          else {
            promise = platformApi.updatePlatform(platformPath, options, events);
          }
          logger.info( `${(cmd === 'add' ? 'Adding' : 'Updating')} ${platform} weexpack-${platform}@${platDetails.version} ...`);
          return promise.then(() => {
            logger.success('Success!');
            return platDetails;
          });
        }
      })
      .then((platDetails) => {
        const saveVersion = !spec || semver.validRange(spec, true);
        // Save platform@spec into platforms.json, where 'spec' is a version or a soure location. If a
        // source location was specified, we always save that. Otherwise we save the version that was
        // actually installed.
        const versionToSave = saveVersion ? platDetails.version : spec;
        logger.verbose('Saving ' + platform + '@' + versionToSave + ' into platforms.json');
        platformMetadata.save(projectRoot, platform, versionToSave);
        return platDetails;
      })
      .then((platDetails) => {
        installForNewPlatform(platDetails.platform);
      })
      .fail(error => {
        logger.error(error.stack);
      });
    });
  }
}

// Downloads via npm or via git clone (tries both)
// Returns a Promise
function downloadPlatform (projectRoot, platform, version, opts) {
  const target = version ? (platform + '@' + version) : platform;
  return Q().then(function () {
    if (tools.isUrl(version)) {
      logger.info('git cloning: ' + version);
      const parts = version.split('#');
      const gitUrl = parts[0];
      const branchToCheckout = parts[1];
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
    logger.error(error)
    const message = 'Failed to fetch platform ' + target + '\nProbably this is either a connection problem, or platform spec is incorrect.' + '\nCheck your connection and platform name/version/URL.' + '\n' + error;
    return Q.reject(new Error(message));
  }).then(function (libDir) {
    return getPlatformDetailsFromDir(libDir, platform);
  });
}

function platformFromName (name) {
  const platMatch = /^weexpack-([a-z0-9-]+)$/.exec(name);
  return platMatch && platMatch[1];
}
// Returns a Promise
// Gets platform details from a directory
function getPlatformDetailsFromDir (dir, platformIfKnown) {
  const libDir = path.resolve(dir);
  let platform;
  let version;
  try {
    const pkg = require(path.join(libDir, 'package'));
    platform = platformFromName(pkg.name);
    version = pkg.version;
  }
  catch (e) {
    // Older platforms didn't have package.json.
    platform = platformIfKnown || platformFromName(path.basename(dir));
    const verFile = fs.existsSync(path.join(libDir, 'VERSION')) ? path.join(libDir, 'VERSION') : fs.existsSync(path.join(libDir, 'CordovaLib', 'VERSION')) ? path.join(libDir, 'CordovaLib', 'VERSION') : null;
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

function addDeprecatedInformationToPlatforms (platformsList) {
  platformsList = platformsList.map(function (p) {
    const platformKey = p.split(' ')[0]; // Remove Version Information
    if (platforms[platformKey].deprecated) {
      p = p.concat(' ', '(deprecated)');
    }
    return p;
  });
  return platformsList;
}

// Used to prevent attempts of installing platforms that are not supported on
// the host OS. E.g. ios on linux.
function hostSupports (platform) {
  const p = platforms[platform] || {};
  const hostos = p.hostos || null;
  if (!hostos) return true;
  if (hostos.indexOf('*') >= 0) return true;
  if (hostos.indexOf(process.platform) >= 0) return true;
  return false;
}

// Remove <platform>.json file from plugins directory.
function removePlatformPluginsJson (projectRoot, target) {
  const pluginsJson = path.join(projectRoot, 'plugins', target + '.json');
  shell.rm('-f', pluginsJson);
}

const platform = (command, targets, opts) => {
  let msg;
  let projectRoot;
  try {
    projectRoot = tools.cdProjectRoot();
  }
  catch(e){
    logger.error(e)
    return;
  }

  if (arguments.length === 0) command = 'ls';

  if (targets) {
    if (!(targets instanceof Array)) targets = [targets];
    targets.forEach(function (t) {
      // Trim the @version part if it's there.
      const p = t.split('@')[0];
      // OK if it's one of known platform names.
      if (p in platforms) return;
      // Not a known platform name, check if its a real path.
      const pPath = path.resolve(t);
      if (fs.existsSync(pPath)) return;
      let msg;
      // If target looks like a url, we will try cloning it with git
      if (/[~:/\\.]/.test(t)) {
        return;
      }
      else {
        // Neither path, git-url nor platform name - throw.
        msg = `Platform ${t} not recognized as a core weex platform. See "${tools.binname} platform list".'`;
      }
      throw new Error(msg);
    });
  }
  else if (command === 'add' || command === 'rm') {
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
