'use strict';

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
// Helper methods to help keep npm operations separated.
var npm = require('npm');
var path = require('path');
var Q = require('q');
var fs = require('fs-extra');
var unpack = require('./unpack');
var tools = require('./tools');
var cachedSettings = null;
var cachedSettingsValues = null;
/**
 * @description Calls npm.load, then initializes npm.config with the specified settings. Then executes a chain of
 * promises that rely on those npm settings, then restores npm settings back to their previous value. Use this rather
 * than passing settings to npm.load, since that only works the first time you try to load npm.
 * @param {Object} settings
 * @param {Function} promiseChain
 */
function loadWithSettingsThenRestore(settings, promiseChain) {
  return loadWithSettings(settings).then(promiseChain).finally(restoreSettings);
}

function loadWithSettings(settings) {
  if (cachedSettings) {
    throw new Error('Trying to initialize npm when settings have not been restored from a previous initialization.');
  }
  return Q.nfcall(npm.load, settings).then(function () {
    for (var prop in settings) {
      var currentValue = npm.config.get(prop);
      var newValue = settings[prop];
      if (currentValue !== newValue) {
        cachedSettingsValues = cachedSettingsValues || {};
        cachedSettings = cachedSettings || [];
        cachedSettings.push(prop);
        if (typeof currentValue !== 'undefined') {
          cachedSettingsValues[prop] = currentValue;
        }
        npm.config.set(prop, newValue);
      }
    }
  });
}

function restoreSettings() {
  if (cachedSettings) {
    cachedSettings.forEach(function (prop) {
      if (prop in cachedSettingsValues) {
        npm.config.set(prop, cachedSettingsValues[prop]);
      } else {
        npm.config.del(prop);
      }
    });
    cachedSettings = null;
    cachedSettingsValues = null;
  }
}

/**
 * Invokes "npm cache add," and then returns a promise that resolves to a directory containing the downloaded,
 * or cached package.
 * @param packageName - name of an npm package
 * @param packageVersion - requested version (not a version range)
 */
function cachePackage(packageName, packageVersion) {
  // todo Market-Injection
  // WEEK_HOOK
  // if(packageName !== "weexpack-android" && packageName !== "weexpack-ios") {
  //     packageName = WeexMarket.info(packageName)
  // }
  // else {
  //     packageName = { fullname: packageName}
  // }
  return Q(packageName).then(function (data) {
    var cacheDir = path.join(tools.libDirectory, 'npm_cache');
    // If already cached, use that rather than calling 'npm cache add' again.
    var packageCacheDir = path.resolve(cacheDir, packageName, packageVersion);
    var packageTGZ = path.resolve(packageCacheDir, 'package.tgz');
    if (fs.existsSync(packageTGZ)) {
      return unpack.unpackTgz(packageTGZ, path.resolve(packageCacheDir, 'package'));
    }
    var npmConfig = {
      'cache': cacheDir
    };
    // Load with NPM configuration
    return loadWithSettingsThenRestore(npmConfig, function () {
      // Invoke NPM Cache Add
      return Q.ninvoke(npm.commands, 'cache', ['add', packageName + '@' + packageVersion]).then(function (info) {
        var packageDir = path.resolve(npm.cache, info.name, info.version, 'package');
        var ninvokePackageTGZ = path.resolve(npm.cache, info.name, info.version, 'package.tgz');
        return unpack.unpackTgz(ninvokePackageTGZ, packageDir);
      });
    });
  });
}

module.exports = {
  invokeNpm: function invokeNpm() {},
  loadWithSettingsThenRestore: loadWithSettingsThenRestore,
  cachePackage: cachePackage
};