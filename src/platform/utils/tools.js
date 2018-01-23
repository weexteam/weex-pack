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

/* jshint sub:true */
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const url = require('url');
const nopt = require('nopt');
const Q = require('q');
const semver = require('semver');

let origCwd = '';

const HOME = process.env[(process.platform.slice(0, 3) === 'win') ? 'USERPROFILE' : 'HOME'];
const globalConfigPath = path.join(HOME, '.wx');

const libDirectory = path.join(globalConfigPath, 'lib');

function getInstalledPlatformsWithVersions (projectDir) {
  const result = {};
  const platforms = listPlatforms(projectDir);
  let installedPlatforms = {};
  const installedPlatformsPath = path.join(projectDir, 'platforms/platforms.json');
  if (fs.existsSync(installedPlatformsPath)) {
    installedPlatforms = JSON.parse(fs.readFileSync(installedPlatformsPath));
  }
  return installedPlatforms;
}

function getOrigWorkingDirectory () {
  return origCwd || process.env.PWD || process.cwd();
}

// Fixes up relative paths that are no longer valid due to chdir() within cdProjectRoot().
function fixRelativePath (value, /* optional */ cwd) {
  // Don't touch absolute paths.
  if (value[1] === ':' || value[0] === path.sep) {
    return value;
  }
  const newDir = cwd || process.env.PWD || process.cwd();
  const origDir = getOrigWorkingDirectory();
  const pathDiff = path.relative(newDir, origDir);
  const ret = path.normalize(path.join(pathDiff, value));
  return ret;
}

function isDirectory (dir) {
  try {
    return fs.lstatSync(dir).isDirectory();
  }
  catch (e) {
    return false;
  }
}
function isUrl (value) {
  const u = value && url.parse(value);
  return !!(u && u.protocol && u.protocol.length > 2); // Account for windows c:/ paths
}

// Cd to project root dir and return its path. Throw Error if not in a Corodva project.
function cdProjectRoot (dir) {
  const projectRoot = this.isWeex(dir);
  if (!projectRoot) {
    throw new Error('Current working directory is not a weex project.');
  }
  if (!origCwd) {
    origCwd = process.env.PWD || process.cwd();
  }
  process.env.PWD = projectRoot;
  process.chdir(projectRoot);
  return projectRoot;
}

// Runs up the directory chain looking for a .wx directory.
// IF it is found we are in a Weex project.
// Omit argument to use CWD.
function isWeex (dir) {
  if (!dir) {
    // Prefer PWD over cwd so that symlinked dirs within your PWD work correctly (CB-5687).
    const pwd = process.env.PWD;
    const cwd = process.cwd();
    if (pwd && pwd !== cwd && pwd !== 'undefined') {
      return this.isWeex(pwd) || this.isWeex(cwd);
    }
    return this.isWeex(cwd);
  }
  let bestReturnValueSoFar = false;
  for (let i = 0; i < 1000; ++i) {
    const result = isRootDir(dir);
    if (result === 2) {
      return dir;
    }
    if (result === 1) {
      bestReturnValueSoFar = dir;
    }
    const parentDir = path.normalize(path.join(dir, '..'));
        // Detect fs root.
    if (parentDir === dir) {
      return bestReturnValueSoFar;
    }
    dir = parentDir;
  }
  return false;
}

function isRootDir (dir) {
  if (fs.existsSync(path.join(dir, 'platforms'))) {
    if (fs.existsSync(path.join(dir, 'web'))) {
      // For sure is.
      return 1;
    }
  }
  return 0;
}

/**
 * Returns the latest version of the specified module on npm that matches the specified version or range.
 * @param {string} moduleName - npm module name.
 * @param {string} version - semver version or range (loose allowed).
 * @returns {Promise} Promise for version (a valid semver version if one is found, otherwise whatever was provided).
 */
function getLatestMatchingNpmVersion (moduleName, version) {
  if (!version) {
        // If no version specified, get the latest
    return getLatestNpmVersion(moduleName);
  }

  const validVersion = semver.valid(version, /* loose */ true);
  if (validVersion) {
        // This method is really intended to work with ranges, so if a version rather than a range is specified, we just
        // assume it is available and return it, bypassing the need for the npm call.
    return Q(validVersion);
  }

  const validRange = semver.validRange(version, /* loose */ true);
  if (!validRange) {
        // Just return what we were passed
    return Q(version);
  }

  return getAvailableNpmVersions(moduleName).then(function (versions) {
    return semver.maxSatisfying(versions, validRange) || version;
  });
}

/**
 * Returns a promise for an array of versions available for the specified npm module.
 * @param {string} moduleName - npm module name.
 * @returns {Promise} Promise for an array of versions.
 */
function getAvailableNpmVersions (moduleName) {
  const npm = require('npm');
  return Q.nfcall(npm.load).then(function () {
    return Q.ninvoke(npm.commands, 'view', [moduleName, 'versions'], /* silent = */ true).then(function (result) {
            // result is an object in the form:
            //     {'<version>': {versions: ['1.2.3', '1.2.4', ...]}}
            // (where <version> is the latest version)
      return result[Object.keys(result)[0]].versions;
    });
  });
}


function listPlatforms (projectDir) {
  const platforms = require('../platforms');
  const platformsDir = path.join(projectDir, 'platforms');
  if (!fs.existsSync(platformsDir)) {
    return [];
  }
  const subdirs = fs.readdirSync(platformsDir);
  return subdirs.filter(function (p) {
    return Object.keys(platforms).indexOf(p) > -1;
  });
}

exports.listPlatforms = listPlatforms;
exports.libDirectory = libDirectory
exports.isRootDir = isRootDir;
exports.cdProjectRoot = cdProjectRoot;
exports.isWeex = isWeex;
exports.binname = 'weex';
exports.getInstalledPlatformsWithVersions = getInstalledPlatformsWithVersions;
exports.fixRelativePath = fixRelativePath;
exports.isDirectory = isDirectory;
exports.isUrl = isUrl;
exports.getLatestMatchingNpmVersion = getLatestMatchingNpmVersion;
