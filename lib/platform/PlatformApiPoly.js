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

var Q = require('q');
var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

var knownPlatforms = require('./platforms');

function copyPlatform(templateDir, projectDir) {
  var templateFiles = fs.readdirSync(templateDir);
  // Remove directories, and files that are unwanted
  // Copy each template file after filter
  for (var i = 0; i < templateFiles.length; i++) {
    var p = path.resolve(templateDir, templateFiles[i]);
    shell.cp('-R', p, projectDir);
  }
}
/**
 * Class, that acts as abstraction over particular platform. Encapsulates the
 *   platform's properties and methods.
 *
 * Platform that implements own PlatformApi instance _should implement all
 *   prototype methods_ of this class to be fully compatible with cordova-lib.
 *
 * The PlatformApi instance also should define the following field:
 *
 * * platform: String that defines a platform name.
 */
function PlatformApiPoly(platform, platformRootDir, events) {
  if (!platform) throw new Error('\'platform\' argument is missing');
  if (!platformRootDir) throw new Error('platformRootDir argument is missing');

  this.root = platformRootDir;
  this.platform = platform;
  this.events = events || require('weexpack-common').events;

  if (!(platform in knownPlatforms)) {
    throw new Error('Unknown platform ' + platform);
  }

  var ParserConstructor = require(knownPlatforms[platform].parser_file);
  this._parser = new ParserConstructor(this.root);
  this._handler = require(knownPlatforms[platform].handler_file);
}

/**
 * Installs platform to specified directory and creates a platform project.
 *
 * @param  {String}  destinationDir  A directory, where platform should be
 *   created/installed.
 * @param  {} [projectConfig] A  instance, used to get
 *   some application properties for new platform like application name, package
 *   id, etc. If not defined, this means that platform is used as standalone
 *   project and is not a part of cordova project, so platform will use some
 *   default values.
 * @param  {Object}   [options]  An options object. The most common options are:
 * @param  {String}   [options.customTemplate]  A path to custom template, that
 *   should override the default one from platform.
 * @param  {Boolean}  [options.link=false]  Flag that indicates that platform's
 *   sources will be linked to installed platform instead of copying.
 *
 * @return {Promise<PlatformApi>} Promise either fulfilled with PlatformApi
 *   instance or rejected with Error.
 */
PlatformApiPoly.createPlatform = function (destinationDir, projectConfig, options) {
  if (!options || !options.platformDetails) {
    return Q.reject(new Error('Failed to find platform\'s \'create\' script. ' + 'Either \'options\' parameter or \'platformDetails\' option is missing'));
  }
  var templatePath = path.join(options.platformDetails.libDir, 'bin', 'templates');
  return Q().then(function () {
    copyPlatform(templatePath, destinationDir);
    return PlatformApiPoly;
  });
};

/**
 * Updates already installed platform.
 *
 * @param  {String}  destinationDir  A directory, where existing platform
 *   installed, that should be updated.
 * @param  {Object}  [options]  An options object. The most common options are:
 * @param  {String}  [options.customTemplate]  A path to custom template, that
 *   should override the default one from platform.
 * @param  {Boolean}  [options.link=false]  Flag that indicates that platform's sources
 *   will be linked to installed platform instead of copying.
 *
 * @return {Promise<PlatformApi>} Promise either fulfilled with PlatformApi
 *   instance or rejected with Error.
 */
PlatformApiPoly.updatePlatform = function (destinationDir, options, events) {
  if (!options || !options.platformDetails) {
    return Q.reject(new Error('Failed to find platform\'s \'create\' script. ' + 'Either \'options\' parameter or \'platformDetails\' option is missing'));
  }
  var templatePath = path.join(options.platformDetails.libDir, 'bin', 'templates');
  return Q().then(function () {
    shell.rm('-rf', destinationDir);
    copyPlatform(templatePath, destinationDir);
    return PlatformApiPoly;
  });
};

module.exports = PlatformApiPoly;