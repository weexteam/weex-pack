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

const path = require('path');
// const util = require('../cordova/util');
const platforms = require('./platformsConfig.json');
const events = require('weexpack-common').events;
// Avoid loading the same platform projects more than once (identified by path)
let cachedApis = {};

// getPlatformApi() should be the only method of instantiating the
// PlatformProject classes for now.
// function getPlatformApi(platform, platformRootDir) {

//     // if platformRootDir is not specified, try to detect it first
//     if (!platformRootDir) {
//         const projectRootDir = util.isCordova();
//         platformRootDir = projectRootDir && path.join(projectRootDir, 'platforms', platform);
//     }

//     if (!platformRootDir) {
//         // If platformRootDir is still undefined, then we're probably is not inside of cordova project
//         throw new Error('Current location is not a weexpack project');
//     }

//     // CB-11174 Resolve symlinks first before working with root directory
//     platformRootDir = util.convertToRealPathSafe(platformRootDir);

//     const cached = cachedApis[platformRootDir];
//     if (cached && cached.platform == platform) return cached;

//     if (!platforms[platform]) throw new Error('Unknown platform ' + platform);


//     //WEEK_HOOK
//     // try {
//     //     // First we need to find whether platform exposes its' API via js module
//     //     // If it does, then we require and instantiate it.
//     //     var platformApiModule = path.join(platformRootDir, 'cordova', 'Api.js');
//     //     PlatformApi = require(platformApiModule);
//     // } catch (err) {
//     //     // Check if platform already compatible w/ PlatformApi and show deprecation warning
//     //     if (err && err.code === 'MODULE_NOT_FOUND' && platforms[platform].apiCompatibleSince) {
//     //         events.emit('warn', ' Using this version of weexpack with older version of weexpack-' + platform +
//     //             ' is being deprecated. Consider upgrading to weexpack-' + platform + '@' +
//     //             platforms[platform].apiCompatibleSince + ' or newer.');
//     //     } else {
//     //         events.emit('warn', 'Error loading weexpack-'+platform);
//     //     }
//     //
//     //     PlatformApi = require('./PlatformApiPoly');
//     // }

//     const platformPath = platform + '_' + 'pack';
//     const platformApiPath = path.join(__dirname, platformPath, 'Api.js');
//     const PlatformApi = require(platformApiPath);

//     const platformApi = new PlatformApi(platform, platformRootDir, events);
//     cachedApis[platformRootDir] = platformApi;
//     return platformApi;
// }

function getRealPlatformApi(platform, platformRootDir) {

  const cached = cachedApis[__dirname];
  if (cached && cached.platform == platform) return cached;

  if (!platforms[platform]) throw new Error('Unknown platform ' + platform);

  try {
    // First we need to find whether platform exposes its' API via js module
    // If it does, then we require and instantiate it.
    const platformPath = platform + '_' + 'pack';
    const platformApiPath = path.join(__dirname, platformPath, 'Api.js');
    const PlatformApi = require(platformApiPath);
  } catch (err) {
    // Check if platform already compatible w/ PlatformApi and show deprecation warning
    if (err && err.code === 'MODULE_NOT_FOUND' && platforms[platform].apiCompatibleSince) {
      events.emit('warn', ' Using this version of weexpack with older version of weexpack-' + platform +
        ' is being deprecated. Consider upgrading to weexpack-' + platform + '@' +
        platforms[platform].apiCompatibleSince + ' or newer.');
    } else {
      events.emit('warn', 'Error loading weexpack-'+platform);
    }

    PlatformApi = require('./PlatformApiPoly');
  }

  const platformApi = new PlatformApi(platform, platformRootDir, events);
  // cachedApis[__dirname] = platformApi;
  return platformApi;
}

module.exports = platforms;

// We don't want these methods to be enumerable on the platforms object, because we expect enumerable properties of the
// platforms object to be platforms.
Object.defineProperties(module.exports, {
    // 'getPlatformApi': {value: getPlatformApi, configurable: true, writable: true},
    'getRealPlatformApi':{value: getRealPlatformApi, configurable: true, writable: true}
});
