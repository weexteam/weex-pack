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

const Q = require('q');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const knownPlatforms = require('./platforms');

const weexpackCommon = require('weexpack-common');
const superspawn = weexpackCommon.superspawn;
const xmlHelpers = weexpackCommon.xmlHelpers;
const CordovaError = weexpackCommon.CordovaError;
const PluginInfo = weexpackCommon.PluginInfo;
const ConfigParser = weexpackCommon.ConfigParser;
const PlatformJson = weexpackCommon.PlatformJson;
const ActionStack = weexpackCommon.ActionStack;
const PlatformMunger = weexpackCommon.ConfigChanges.PlatformMunger;
const PluginInfoProvider = weexpackCommon.PluginInfoProvider;

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
function PlatformApiPoly (platform, platformRootDir, events) {
  if (!platform) throw new CordovaError('\'platform\' argument is missing');
  if (!platformRootDir) throw new CordovaError('platformRootDir argument is missing');

  this.root = platformRootDir;
  this.platform = platform;
  this.events = events || require('weexpack-common').events;

  if (!(platform in knownPlatforms)) { throw new CordovaError('Unknown platform ' + platform); }

  const ParserConstructor = require(knownPlatforms[platform].parser_file);
  this._parser = new ParserConstructor(this.root);
  this._handler = require(knownPlatforms[platform].handler_file);

  this._platformJson = PlatformJson.load(this.root, platform);
  this._pluginInfoProvider = new PluginInfoProvider();
  this._munger = new PlatformMunger(platform, this.root, this._platformJson, this._pluginInfoProvider);
}

/**
 * Installs platform to specified directory and creates a platform project.
 *
 * @param  {String}  destinationDir  A directory, where platform should be
 *   created/installed.
 * @param  {ConfigParser} [projectConfig] A ConfigParser instance, used to get
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
 *   instance or rejected with CordovaError.
 */
PlatformApiPoly.createPlatform = function (destinationDir, projectConfig, options) {
  if (!options || !options.platformDetails) {
    return Q.reject(new CordovaError('Failed to find platform\'s \'create\' script. ' +
            'Either \'options\' parameter or \'platformDetails\' option is missing'));
  }
  const templatePath = path.join(options.platformDetails.libDir, 'bin', 'templates');
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
 *   instance or rejected with CordovaError.
 */
PlatformApiPoly.updatePlatform = function (destinationDir, options, events) {
  if (!options || !options.platformDetails) {
    return Q.reject(new CordovaError('Failed to find platform\'s \'create\' script. ' +
        'Either \'options\' parameter or \'platformDetails\' option is missing'));
  }
  const templatePath = path.join(options.platformDetails.libDir, 'bin', 'templates');
  return Q().then(function () {
    shell.rm('-rf', destinationDir);
    copyPlatform(templatePath, destinationDir);
    return PlatformApiPoly;
  });
};

/**
 * Gets a CordovaPlatform object, that represents the platform structure.
 *
 * @return  {CordovaPlatform}  A structure that contains the description of
 *   platform's file structure and other properties of platform.
 */
PlatformApiPoly.prototype.getPlatformInfo = function () {
  const self = this;
  const result = {};
  result.locations = {
    www: self._parser.www_dir(),
    platformWww: path.join(self.root, 'platform_www'),
    configXml: self._parser.config_xml(),
        // NOTE: Due to platformApi spec we need to return relative paths here
    cordovaJs: path.relative(self.root, self._parser.cordovajs_path.call(self.parser, self.root)),
    cordovaJsSrc: path.relative(self.root, self._parser.cordovajs_src_path.call(self.parser, self.root))
  };
  result.root = self.root;
  result.name = self.platform;
  self.version = result.version = self.version || getPlatformVersion(self.root) || knownPlatforms[self.platform].version;
  result.projectConfig = self._config;

  return result;
};

/**
 * Updates installed platform with provided www assets and new app
 *   configuration. This method is required for CLI workflow and will be called
 *   each time before build, so the changes, made to app configuration and www
 *   code, will be applied to platform.
 *
 * @param {CordovaProject} cordovaProject A CordovaProject instance, that defines a
 *   project structure and configuration, that should be applied to platform
 *   (contains project's www location and ConfigParser instance for project's
 *   config).
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
PlatformApiPoly.prototype.prepare = function (cordovaProject, options) {
    // First cleanup current config and merge project's one into own
  const defaultConfig = path.join(this.root, 'cordova', 'defaults.xml');
  const ownConfig = this.getPlatformInfo().locations.configXml;

  const sourceCfg = cordovaProject.projectConfig;
    // If defaults.xml is present, overwrite platform config.xml with it.
    // Otherwise save whatever is there as defaults so it can be
    // restored or copy project config into platform if none exists.
  if (fs.existsSync(defaultConfig)) {
    this.events.emit('verbose', 'Generating config.xml from defaults for platform "' + this.platform + '"');
    shell.cp('-f', defaultConfig, ownConfig);
  }
  else if (fs.existsSync(ownConfig)) {
    shell.cp('-f', ownConfig, defaultConfig);
  }
  else {
    shell.cp('-f', sourceCfg.path, ownConfig);
  }

  this._munger.reapply_global_munge().save_all();

  this._config = new ConfigParser(ownConfig);
  xmlHelpers.mergeXml(cordovaProject.projectConfig.doc.getroot(),
        this._config.doc.getroot(), this.platform, true);
  this._config.write();

    // Update own www dir with project's www assets and plugins' assets and js-files
  this._parser.update_www(cordovaProject.locations.www);

    // update project according to config.xml changes.
  return this._parser.update_project(this._config, options);
};

/**
 * Installs a new plugin into platform. This method only copies non-www files
 *   (sources, libs, etc.) to platform. It also doesn't resolves the
 *   dependencies of plugin. Both of handling of www files, such as assets and
 *   js-files and resolving dependencies are the responsibility of caller.
 *
 * @param  {PluginInfo}  plugin  A PluginInfo instance that represents plugin
 *   that will be installed.
 * @param  {Object}  installOptions  An options object. Possible options below:
 * @param  {Boolean}  installOptions.link: Flag that specifies that plugin
 *   sources will be symlinked to app's directory instead of copying (if
 *   possible).
 * @param  {Object}  installOptions.variables  An object that represents
 *   variables that will be used to install plugin. See more details on plugin
 *   variables in documentation:
 *   https://cordova.apache.org/docs/en/4.0.0/plugin_ref_spec.md.html
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
PlatformApiPoly.prototype.addPlugin = function (plugin, installOptions) {
  if (!plugin || !(plugin instanceof PluginInfo)) {
    return Q.reject('The parameter is incorrect. The first parameter ' +
            'should be valid PluginInfo instance');
  }

  installOptions = installOptions || {};
  installOptions.variables = installOptions.variables || {};
    // CB-10108 platformVersion option is required for proper plugin installation
  installOptions.platformVersion = installOptions.platformVersion ||
        this.getPlatformInfo().version;

  const self = this;
  const actions = new ActionStack();
  const projectFile = this._handler.parseProjectFile && this._handler.parseProjectFile(this.root);

    // gather all files needs to be handled during install
  plugin.getFilesAndFrameworks(this.platform)
        .concat(plugin.getAssets(this.platform))
        .concat(plugin.getJsModules(this.platform))
    .forEach(function (item) {
      actions.push(actions.createAction(
            self._getInstaller(item.itemType), [item, plugin.dir, plugin.id, installOptions, projectFile],
            self._getUninstaller(item.itemType), [item, plugin.dir, plugin.id, installOptions, projectFile]));
    });

    // run through the action stack
  return actions.process(this.platform, this.root)
    .then(function () {
      if (projectFile) {
        projectFile.write();
      }

        // Add PACKAGE_NAME variable into vars
      if (!installOptions.variables.PACKAGE_NAME) {
        installOptions.variables.PACKAGE_NAME = self._handler.package_name(self.root);
      }

      self._munger
            // Ignore passed `is_top_level` option since platform itself doesn't know
            // anything about managing dependencies - it's responsibility of caller.
            .add_plugin_changes(plugin, installOptions.variables, /* is_top_level=*/true, /* should_increment=*/true)
            .save_all();

      const targetDir = installOptions.usePlatformWww ?
            self.getPlatformInfo().locations.platformWww :
            self.getPlatformInfo().locations.www;

      self._addModulesInfo(plugin, targetDir);
    });
};

/**
 * Removes an installed plugin from platform.
 *
 * Since method accepts PluginInfo instance as input parameter instead of plugin
 *   id, caller shoud take care of managing/storing PluginInfo instances for
 *   future uninstalls.
 *
 * @param  {PluginInfo}  plugin  A PluginInfo instance that represents plugin
 *   that will be installed.
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError instance.
 */
PlatformApiPoly.prototype.removePlugin = function (plugin, uninstallOptions) {
  uninstallOptions = uninstallOptions || {};
    // CB-10108 platformVersion option is required for proper plugin installation
  uninstallOptions.platformVersion = uninstallOptions.platformVersion ||
        this.getPlatformInfo().version;

  const self = this;
  const actions = new ActionStack();
  const projectFile = this._handler.parseProjectFile && this._handler.parseProjectFile(this.root);

    // queue up plugin files
  plugin.getFilesAndFrameworks(this.platform)
        .concat(plugin.getAssets(this.platform))
        .concat(plugin.getJsModules(this.platform))
    .forEach(function (item) {
      actions.push(actions.createAction(
            self._getUninstaller(item.itemType), [item, plugin.dir, plugin.id, uninstallOptions, projectFile],
            self._getInstaller(item.itemType), [item, plugin.dir, plugin.id, uninstallOptions, projectFile]));
    });

    // run through the action stack
  return actions.process(this.platform, this.root)
    .then(function () {
      if (projectFile) {
        projectFile.write();
      }

      self._munger
            // Ignore passed `is_top_level` option since platform itself doesn't know
            // anything about managing dependencies - it's responsibility of caller.
            .remove_plugin_changes(plugin, /* is_top_level=*/true)
            .save_all();

      const targetDir = uninstallOptions.usePlatformWww ?
            self.getPlatformInfo().locations.platformWww :
            self.getPlatformInfo().locations.www;

      self._removeModulesInfo(plugin, targetDir);
        // Remove stale plugin directory
        // TODO: this should be done by plugin files uninstaller
      shell.rm('-rf', path.resolve(self.root, 'Plugins', plugin.id));
    });
};

PlatformApiPoly.prototype.updatePlugin = function (plugin, updateOptions) {
  const self = this;

    // Set up assets installer to copy asset files into platform_www dir instead of www
  updateOptions = updateOptions || {};
  updateOptions.usePlatformWww = true;

  return this.removePlugin(plugin, updateOptions)
    .then(function () {
      return self.addPlugin(plugin, updateOptions);
    });
};

/**
 * Builds an application package for current platform.
 *
 * @param  {Object}  buildOptions  A build options. This object's structure is
 *   highly depends on platform's specific. The most common options are:
 * @param  {Boolean}  buildOptions.debug  Indicates that packages should be
 *   built with debug configuration. This is set to true by default unless the
 *   'release' option is not specified.
 * @param  {Boolean}  buildOptions.release  Indicates that packages should be
 *   built with release configuration. If not set to true, debug configuration
 *   will be used.
 * @param   {Boolean}  buildOptions.device  Specifies that built app is intended
 *   to run on device
 * @param   {Boolean}  buildOptions.emulator: Specifies that built app is
 *   intended to run on emulator
 * @param   {String}  buildOptions.target  Specifies the device id that will be
 *   used to run built application.
 * @param   {Boolean}  buildOptions.nobuild  Indicates that this should be a
 *   dry-run call, so no build artifacts will be produced.
 * @param   {String[]}  buildOptions.archs  Specifies chip architectures which
 *   app packages should be built for. List of valid architectures is depends on
 *   platform.
 * @param   {String}  buildOptions.buildConfig  The path to build configuration
 *   file. The format of this file is depends on platform.
 * @param   {String[]} buildOptions.argv Raw array of command-line arguments,
 *   passed to `build` command. The purpose of this property is to pass a
 *   platform-specific arguments, and eventually let platform define own
 *   arguments processing logic.
 *
 * @return {Promise<Object[]>} A promise either fulfilled with an array of build
 *   artifacts (application packages) if package was built successfully,
 *   or rejected with CordovaError. The resultant build artifact objects is not
 *   strictly typed and may conatin arbitrary set of fields as in sample below.
 *
 *     {
 *         architecture: 'x86',
 *         buildType: 'debug',
 *         path: '/path/to/build',
 *         type: 'app'
 *     }
 *
 * The return value in most cases will contain only one item but in some cases
 *   there could be multiple items in output array, e.g. when multiple
 *   arhcitectures is specified.
 */
PlatformApiPoly.prototype.build = function (buildOptions) {
  const command = path.join(this.root, 'cordova', 'build');
  const commandArguments = getBuildArgs(buildOptions);
  return superspawn.spawn(command, commandArguments, {
    printCommand: true, stdio: 'inherit', chmod: true });
};

/**
 * Builds an application package for current platform and runs it on
 *   specified/default device. If no 'device'/'emulator'/'target' options are
 *   specified, then tries to run app on default device if connected, otherwise
 *   runs the app on emulator.
 *
 * @param   {Object}  runOptions  An options object. The structure is the same
 *   as for build options.
 *
 * @return {Promise} A promise either fulfilled if package was built and ran
 *   successfully, or rejected with CordovaError.
 */
PlatformApiPoly.prototype.run = function (runOptions) {
  const command = path.join(this.root, 'cordova', 'run');
  const commandArguments = getBuildArgs(runOptions);
  return superspawn.spawn(command, commandArguments, {
    printCommand: true, stdio: 'inherit', chmod: true });
};

/**
 * Cleans out the build artifacts from platform's directory.
 *
 * @return  {Promise}  Return a promise either fulfilled, or rejected with
 *   CordovaError.
 */
PlatformApiPoly.prototype.clean = function () {
  const cmd = path.join(this.root, 'cordova', 'clean');
  return superspawn.spawn(cmd, [], { printCommand: true, stdio: 'inherit', chmod: true });
};

/**
 * Performs a requirements check for current platform. Each platform defines its
 *   own set of requirements, which should be resolved before platform can be
 *   built successfully.
 *
 * @return  {Promise<Requirement[]>}  Promise, resolved with set of Requirement
 *   objects for current platform.
 */
PlatformApiPoly.prototype.requirements = function () {
  const modulePath = path.join(this.root, 'cordova', 'lib', 'check_reqs');
  try {
    return require(modulePath).check_all();
  }
  catch (e) {
    const errorMsg = 'Failed to check requirements for ' + this.platform + ' platform. ' +
            'check_reqs module is missing for platform. Skipping it...';
    return Q.reject(errorMsg);
  }
};

module.exports = PlatformApiPoly;

/**
 * Reconstructs the buildOptions tat will be passed along to platform scripts.
 *   This is an ugly temporary fix. The code spawning or otherwise calling into
 *   platform code should be dealing with this based on the parsed args object.
 *
 * @param   {Object}  options  A build options set, passed to `build` method
 *
 * @return  {String[]}         An array or arguments which can be passed to
 *   `create` build script.
 */
function getBuildArgs (options) {
    // if no options passed, empty object will be returned
  if (!options) return [];

  const downstreamArgs = [];
  const argNames = [
    'debug',
    'release',
    'device',
    'emulator',
    'nobuild',
    'list'
  ];

  argNames.forEach(function (flag) {
    if (options[flag]) {
      downstreamArgs.push('--' + flag);
    }
  });

  if (options.buildConfig) {
    downstreamArgs.push('--buildConfig=' + options.buildConfig);
  }
  if (options.target) {
    downstreamArgs.push('--target=' + options.target);
  }
  if (options.archs) {
    downstreamArgs.push('--archs=' + options.archs);
  }

  const unparsedArgs = options.argv || [];
  return downstreamArgs.concat(unparsedArgs);
}

/**
 * Removes the specified modules from list of installed modules and updates
 *   platform_json and cordova_plugins.js on disk.
 *
 * @param   {PluginInfo}  plugin  PluginInfo instance for plugin, which modules
 *   needs to be added.
 * @param   {String}  targetDir  The directory, where updated cordova_plugins.js
 *   should be written to.
 */
PlatformApiPoly.prototype._addModulesInfo = function (plugin, targetDir) {
  const installedModules = this._platformJson.root.modules || [];

  const installedPaths = installedModules.map(function (installedModule) {
    return installedModule.file;
  });

  const modulesToInstall = plugin.getJsModules(this.platform)
    .filter(function (moduleToInstall) {
      return installedPaths.indexOf(moduleToInstall.file) === -1;
    }).map(function (moduleToInstall) {
      const moduleName = plugin.id + '.' + (moduleToInstall.name || moduleToInstall.src.match(/([^/]+)\.js/)[1]);
      const obj = {
        file: ['plugins', plugin.id, moduleToInstall.src].join('/'),
        id: moduleName,
        pluginId: plugin.id
      };
      if (moduleToInstall.clobbers.length > 0) {
        obj.clobbers = moduleToInstall.clobbers.map(function (o) { return o.target; });
      }
      if (moduleToInstall.merges.length > 0) {
        obj.merges = moduleToInstall.merges.map(function (o) { return o.target; });
      }
      if (moduleToInstall.runs) {
        obj.runs = true;
      }

      return obj;
    });

  this._platformJson.root.modules = installedModules.concat(modulesToInstall);
  if (!this._platformJson.root.plugin_metadata) {
    this._platformJson.root.plugin_metadata = {};
  }
  this._platformJson.root.plugin_metadata[plugin.id] = plugin.version;

  this._writePluginModules(targetDir);
  this._platformJson.save();
};

/**
 * Removes the specified modules from list of installed modules and updates
 *   platform_json and cordova_plugins.js on disk.
 *
 * @param   {PluginInfo}  plugin  PluginInfo instance for plugin, which modules
 *   needs to be removed.
 * @param   {String}  targetDir  The directory, where updated cordova_plugins.js
 *   should be written to.
 */
PlatformApiPoly.prototype._removeModulesInfo = function (plugin, targetDir) {
  const installedModules = this._platformJson.root.modules || [];
  const modulesToRemove = plugin.getJsModules(this.platform)
    .map(function (jsModule) {
      return ['plugins', plugin.id, jsModule.src].join('/');
    });

  const updatedModules = installedModules
    .filter(function (installedModule) {
      return (modulesToRemove.indexOf(installedModule.file) === -1);
    });

  this._platformJson.root.modules = updatedModules;
  if (this._platformJson.root.plugin_metadata) {
    delete this._platformJson.root.plugin_metadata[plugin.id];
  }

  this._writePluginModules(targetDir);
  this._platformJson.save();
};

/**
 * Fetches all installed modules, generates cordova_plugins contents and writes
 *   it to file.
 *
 * @param   {String}  targetDir  Directory, where write cordova_plugins.js to.
 *   Ususally it is either <platform>/www or <platform>/platform_www
 *   directories.
 */
PlatformApiPoly.prototype._writePluginModules = function (targetDir) {
    // Write out moduleObjects as JSON wrapped in a cordova module to cordova_plugins.js
  let finalContents = 'cordova.define(\'cordova/plugin_list\', function(require, exports, module) {\n';
  finalContents += 'module.exports = ' + JSON.stringify(this._platformJson.root.modules, null, '    ') + ';\n';
  finalContents += 'module.exports.metadata = \n';
  finalContents += '// TOP OF METADATA\n';
  finalContents += JSON.stringify(this._platformJson.root.plugin_metadata || {}, null, '    ') + '\n';
  finalContents += '// BOTTOM OF METADATA\n';
  finalContents += '});'; // Close cordova.define.

  shell.mkdir('-p', targetDir);
  fs.writeFileSync(path.join(targetDir, 'cordova_plugins.js'), finalContents, 'utf-8');
};

PlatformApiPoly.prototype._getInstaller = function (type) {
  const self = this;
  return function (item, pluginDir, pluginId, options, project) {
    const installer = self._handler[type];

    const wwwDest = options.usePlatformWww ?
            self.getPlatformInfo().locations.platformWww :
            self._handler.www_dir(self.root);

    const installerArgs = type === 'asset' ? [wwwDest] :
            type === 'js-module' ? [pluginId, wwwDest] :
            [self.root, pluginId, options, project];

    installer.install.apply(null, [item, pluginDir].concat(installerArgs));
  };
};

PlatformApiPoly.prototype._getUninstaller = function (type) {
  const self = this;
  return function (item, pluginDir, pluginId, options, project) {
    const uninstaller = self._handler[type];

    const wwwDest = options.usePlatformWww ?
            self.getPlatformInfo().locations.platformWww :
            self._handler.www_dir(self.root);

    const uninstallerArgs = (type === 'asset' || type === 'js-module') ? [wwwDest, pluginId] :
            [self.root, pluginId, options, project];

    uninstaller.uninstall.apply(null, [item].concat(uninstallerArgs));
  };
};

function copyPlatform (templateDir, projectDir) {
  const templateFiles = fs.readdirSync(templateDir);
    // Remove directories, and files that are unwanted

    // Copy each template file after filter
  for (let i = 0; i < templateFiles.length; i++) {
    const p = path.resolve(templateDir, templateFiles[i]);
    shell.cp('-R', p, projectDir);
  }
}

/**
 * Gets platform version from 'version' file
 *
 * @param   {String}  platformRoot  Platform location
 * @return  {String|null}           Stringified version of platform or null
 *   if it is not possible to retrieve version
 */
function getPlatformVersion (platformRoot) {
  const versionFile = path.join(platformRoot, 'cordova/version');

  if (!fs.existsSync(versionFile)) {
    return null;
  }

  const version = shell.cat(versionFile).match(/VERSION\s=\s["'](.*)["'];/m);
  return version && version[1];
}
