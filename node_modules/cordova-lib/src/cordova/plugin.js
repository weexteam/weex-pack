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

var cordova_util  = require('./util'),
    path          = require('path'),
    semver        = require('semver'),
    config        = require('./config'),
    Q             = require('q'),
    CordovaError  = require('cordova-common').CordovaError,
    ConfigParser  = require('cordova-common').ConfigParser,
    fs            = require('fs'),
    shell         = require('shelljs'),
    PluginInfoProvider = require('cordova-common').PluginInfoProvider,
    plugman       = require('../plugman/plugman'),
    pluginMapper  = require('cordova-registry-mapper').newToOld,
    pluginSpec    = require('./plugin_spec_parser'),
    events        = require('cordova-common').events,
    metadata      = require('../plugman/util/metadata'),
    registry      = require('../plugman/registry/registry'),
    chainMap      = require('../util/promise-util').Q_chainmap,
    pkgJson       = require('../../package.json'),
    opener        = require('opener');

// For upper bounds in cordovaDependencies
var UPPER_BOUND_REGEX = /^<\d+\.\d+\.\d+$/;

// Returns a promise.
module.exports = function plugin(command, targets, opts) {
    // CB-10519 wrap function code into promise so throwing error
    // would result in promise rejection instead of uncaught exception
    return Q().then(function () {
        var projectRoot = cordova_util.cdProjectRoot();

        // Dance with all the possible call signatures we've come up over the time. They can be:
        // 1. plugin() -> list the plugins
        // 2. plugin(command, Array of targets, maybe opts object)
        // 3. plugin(command, target1, target2, target3 ... )
        // The targets are not really targets, they can be a mixture of plugins and options to be passed to plugman.

        command = command || 'ls';
        targets = targets || [];
        opts = opts || {};
        if ( opts.length ) {
            // This is the case with multiple targets as separate arguments and opts is not opts but another target.
            targets = Array.prototype.slice.call(arguments, 1);
            opts = {};
        }
        if ( !Array.isArray(targets) ) {
            // This means we had a single target given as string.
            targets = [targets];
        }
        opts.options = opts.options || [];
        opts.plugins = [];

        // TODO: Otherwise HooksRunner will be Object instead of function when run from tests - investigate why
        var HooksRunner = require('../hooks/HooksRunner');
        var hooksRunner = new HooksRunner(projectRoot);
        var config_json = config.read(projectRoot);
        var platformList = cordova_util.listPlatforms(projectRoot);

        // Massage plugin name(s) / path(s)
        var pluginPath = path.join(projectRoot, 'plugins');
        var plugins = cordova_util.findPlugins(pluginPath);
        if (!targets || !targets.length) {
            if (command == 'add' || command == 'rm') {
                return Q.reject(new CordovaError('You need to qualify `'+cordova_util.binname+' plugin add` or `'+cordova_util.binname+' plugin remove` with one or more plugins!'));
            } else {
                targets = [];
            }
        }

        //Split targets between plugins and options
        //Assume everything after a token with a '-' is an option
        var i;
        for (i = 0; i < targets.length; i++) {
            if (targets[i].match(/^-/)) {
                opts.options = targets.slice(i);
                break;
            } else {
                opts.plugins.push(targets[i]);
            }
        }

        // Assume we don't need to run prepare by default
        var shouldRunPrepare = false;

        switch(command) {
            case 'add':
                if (!targets || !targets.length) {
                    return Q.reject(new CordovaError('No plugin specified. Please specify a plugin to add. See `'+cordova_util.binname+' plugin search`.'));
                }

                var xml = cordova_util.projectConfig(projectRoot);
                var cfg = new ConfigParser(xml);
                var searchPath = config_json.plugin_search_path || [];
                if (typeof opts.searchpath == 'string') {
                    searchPath = opts.searchpath.split(path.delimiter).concat(searchPath);
                } else if (opts.searchpath) {
                    searchPath = opts.searchpath.concat(searchPath);
                }
                // Blank it out to appease unit tests.
                if (searchPath.length === 0) {
                    searchPath = undefined;
                }

                opts.cordova = { plugins: cordova_util.findPlugins(pluginPath) };
                return hooksRunner.fire('before_plugin_add', opts)
                .then(function() {
                    var pluginInfoProvider = new PluginInfoProvider();
                    return opts.plugins.reduce(function(soFar, target) {
                        return soFar.then(function() {
                            if (target[target.length - 1] == path.sep) {
                                target = target.substring(0, target.length - 1);
                            }

                            // Fetch the plugin first.
                            var fetchOptions = {
                                searchpath: searchPath,
                                noregistry: opts.noregistry,
                                fetch: opts.fetch || false,
                                save: opts.save,
                                nohooks: opts.nohooks,
                                link: opts.link,
                                pluginInfoProvider: pluginInfoProvider,
                                variables: opts.cli_variables,
                                is_top_level: true
                            };

                            return determinePluginTarget(projectRoot, cfg, target, fetchOptions)
                            .then(function(resolvedTarget) {
                                target = resolvedTarget;
                                events.emit('verbose', 'Calling plugman.fetch on plugin "' + target + '"');
                                return plugman.raw.fetch(target, pluginPath, fetchOptions);
                            })
                            .then(function (directory) {
                                return pluginInfoProvider.get(directory);
                            });
                        })
                        .then(function(pluginInfo) {
                            // Validate top-level required variables
                            var pluginVariables = pluginInfo.getPreferences();
                            opts.cli_variables = opts.cli_variables || {};
                            var pluginEntry = cfg.getPlugin(pluginInfo.id);
                            // Get variables from config.xml
                            var configVariables = pluginEntry ? pluginEntry.variables : {};
                            // Add config variable if it's missing in cli_variables
                            Object.keys(configVariables).forEach(function(variable) {
                                opts.cli_variables[variable] = opts.cli_variables[variable] || configVariables[variable];
                            });
                            var missingVariables = Object.keys(pluginVariables)
                            .filter(function (variableName) {
                                // discard variables with default value
                                return !(pluginVariables[variableName] || opts.cli_variables[variableName]);
                            });

                            if (missingVariables.length) {
                                events.emit('verbose', 'Removing ' + pluginInfo.dir + ' because mandatory plugin variables were missing.');
                                shell.rm('-rf', pluginInfo.dir);
                                var msg = 'Variable(s) missing (use: --variable ' + missingVariables.join('=value --variable ') + '=value).';
                                return Q.reject(new CordovaError(msg));
                            }

                            // Iterate (in serial!) over all platforms in the project and install the plugin.
                            return chainMap(platformList, function (platform) {
                                var platformRoot = path.join(projectRoot, 'platforms', platform),
                                options = {
                                    cli_variables: opts.cli_variables || {},
                                    browserify: opts.browserify || false,
                                    fetch: opts.fetch || false,
                                    save: opts.save,
                                    searchpath: searchPath,
                                    noregistry: opts.noregistry,
                                    link: opts.link,
                                    pluginInfoProvider: pluginInfoProvider,
                                    // Set up platform to install asset files/js modules to <platform>/platform_www dir
                                    // instead of <platform>/www. This is required since on each prepare platform's www dir is changed
                                    // and files from 'platform_www' merged into 'www'. Thus we need to persist these
                                    // files platform_www directory, so they'll be applied to www on each prepare.
                                    usePlatformWww: true,
                                    nohooks: opts.nohooks,
                                    force: opts.force
                                };

                                events.emit('verbose', 'Calling plugman.install on plugin "' + pluginInfo.dir + '" for platform "' + platform);
                                return plugman.raw.install(platform, platformRoot, path.basename(pluginInfo.dir), pluginPath, options)
                                .then(function (didPrepare) {
                                    // If platform does not returned anything we'll need
                                    // to trigger a prepare after all plugins installed
                                    if (!didPrepare) shouldRunPrepare = true;
                                });
                            })
                            .thenResolve(pluginInfo);
                        })
                        .then(function(pluginInfo){
                            // save to config.xml
                            if(saveToConfigXmlOn(config_json, opts)){
                                var src = parseSource(target, opts);
                                var attributes = {
                                    name: pluginInfo.id
                                };

                                if (src) {
                                    attributes.spec = src;
                                } else {
                                    var ver = '~' + pluginInfo.version;
                                    // Scoped packages need to have the package-spec along with the version
                                    var parsedSpec = pluginSpec.parse(target);
                                    if (parsedSpec.scope) {
                                        attributes.spec = parsedSpec.package + '@' + ver;
                                    } else {
                                        attributes.spec = ver;
                                    }
                                }

                                xml = cordova_util.projectConfig(projectRoot);
                                cfg = new ConfigParser(xml);
                                cfg.removePlugin(pluginInfo.id);
                                cfg.addPlugin(attributes, opts.cli_variables);
                                cfg.write();

                                events.emit('results', 'Saved plugin info for "' + pluginInfo.id + '" to config.xml');
                            }
                        });
                    }, Q());
                }).then(function() {
                    // CB-11022 We do not need to run prepare after plugin install until shouldRunPrepare flag is set to true
                    if (!shouldRunPrepare) {
                        return Q();
                    }

                    // Need to require right here instead of doing this at the beginning of file
                    // otherwise tests are failing without any real reason.
                    return require('./prepare').preparePlatforms(platformList, projectRoot, opts);
                }).then(function() {
                    opts.cordova = { plugins: cordova_util.findPlugins(pluginPath) };
                    return hooksRunner.fire('after_plugin_add', opts);
                });
            case 'rm':
            case 'remove':
                if (!targets || !targets.length) {
                    return Q.reject(new CordovaError('No plugin specified. Please specify a plugin to remove. See `'+cordova_util.binname+' plugin list`.'));
                }

                opts.cordova = { plugins: cordova_util.findPlugins(pluginPath) };
                return hooksRunner.fire('before_plugin_rm', opts)
                .then(function() {
                    return opts.plugins.reduce(function(soFar, target) {
                        var validatedPluginId = validatePluginId(target, plugins);
                        if (!validatedPluginId) {
                            return Q.reject(new CordovaError('Plugin "' + target + '" is not present in the project. See `' + cordova_util.binname + ' plugin list`.'));
                        }
                        target = validatedPluginId;

                        // Iterate over all installed platforms and uninstall.
                        // If this is a web-only or dependency-only plugin, then
                        // there may be nothing to do here except remove the
                        // reference from the platform's plugin config JSON.
                        return platformList.reduce(function(soFar, platform) {
                            return soFar.then(function() {
                                var platformRoot = path.join(projectRoot, 'platforms', platform);
                                events.emit('verbose', 'Calling plugman.uninstall on plugin "' + target + '" for platform "' + platform + '"');
                                var options = {
                                    force: opts.force || false
                                };
                                return plugman.raw.uninstall.uninstallPlatform(platform, platformRoot, target, pluginPath, options)
                                .then(function (didPrepare) {
                                    // If platform does not returned anything we'll need
                                    // to trigger a prepare after all plugins installed
                                    if (!didPrepare) shouldRunPrepare = true;
                                });
                            });
                        }, Q())
                        .then(function() {
                            // TODO: Should only uninstallPlugin when no platforms have it.
                            return plugman.raw.uninstall.uninstallPlugin(target, pluginPath, opts);
                        }).then(function(){
                            //remove plugin from config.xml
                            if(saveToConfigXmlOn(config_json, opts)){
                                events.emit('log', 'Removing plugin ' + target + ' from config.xml file...');
                                var configPath = cordova_util.projectConfig(projectRoot);
                                if(fs.existsSync(configPath)){//should not happen with real life but needed for tests
                                    var configXml = new ConfigParser(configPath);
                                    configXml.removePlugin(target);
                                    configXml.write();
                                }
                            }
                        })
                        .then(function(){
                            // Remove plugin from fetch.json
                            events.emit('verbose', 'Removing plugin ' + target + ' from fetch.json');
                            metadata.remove_fetch_metadata(pluginPath, target);
                        });
                    }, Q());
                }).then(function () {
                    // CB-11022 We do not need to run prepare after plugin install until shouldRunPrepare flag is set to true
                    if (!shouldRunPrepare) {
                        return Q();
                    }

                    return require('./prepare').preparePlatforms(platformList, projectRoot, opts);
                }).then(function() {
                    opts.cordova = { plugins: cordova_util.findPlugins(pluginPath) };
                    return hooksRunner.fire('after_plugin_rm', opts);
                });
            case 'search':
                return hooksRunner.fire('before_plugin_search', opts)
                .then(function() {
                    var link = 'http://cordova.apache.org/plugins/';
                    if (opts.plugins.length > 0) {
                        var keywords = (opts.plugins).join(' ');
                        var query = link + '?q=' + encodeURI(keywords);
                        opener(query);
                    }
                    else {
                        opener(link);
                    }

                    return Q.resolve();
                }).then(function() {
                    return hooksRunner.fire('after_plugin_search', opts);
                });
            case 'save':
                // save the versions/folders/git-urls of currently installed plugins into config.xml
                return save(projectRoot, opts);
            default:
                return list(projectRoot, hooksRunner);
        }
    });
};

function determinePluginTarget(projectRoot, cfg, target, fetchOptions) {
    var parsedSpec = pluginSpec.parse(target);

    var id = parsedSpec.package || target;

    // CB-10975 We need to resolve relative path to plugin dir from app's root before checking whether if it exists
    var maybeDir = cordova_util.fixRelativePath(id);
    if (parsedSpec.version || cordova_util.isUrl(id) || cordova_util.isDirectory(maybeDir)) {
        return Q(target);
    }

    // If no version is specified, retrieve the version (or source) from config.xml
    events.emit('verbose', 'No version specified for ' + parsedSpec.package + ', retrieving version from config.xml');
    var ver = getVersionFromConfigFile(id, cfg);

    if (cordova_util.isUrl(ver) || cordova_util.isDirectory(ver) || pluginSpec.parse(ver).scope) {
        return Q(ver);
    }

    // If version exists in config.xml, use that
    if (ver) {
        return Q(id + '@' + ver);
    }

    // If no version is given at all and we are fetching from npm, we
    // can attempt to use the Cordova dependencies the plugin lists in
    // their package.json
    var shouldUseNpmInfo = !fetchOptions.searchpath && !fetchOptions.noregistry;

    events.emit('verbose', 'No version for ' + parsedSpec.package + ' saved in config.xml');
    if(shouldUseNpmInfo) {
        events.emit('verbose', 'Attempting to use npm info for ' + parsedSpec.package + ' to choose a compatible release');
    } else {
        events.emit('verbose', 'Not checking npm info for ' + parsedSpec.package + ' because searchpath or noregistry flag was given');
    }

    return (shouldUseNpmInfo ? registry.info([id])
    .then(function(pluginInfo) {
        return getFetchVersion(projectRoot, pluginInfo, pkgJson.version);
    }) : Q(null))
    .then(function(fetchVersion) {
        return fetchVersion ? (id + '@' + fetchVersion) : target;
    });
}

// Exporting for testing purposes
module.exports.getFetchVersion = getFetchVersion;

function validatePluginId(pluginId, installedPlugins) {
    if (installedPlugins.indexOf(pluginId) >= 0) {
        return pluginId;
    }

    var oldStylePluginId = pluginMapper[pluginId];
    if (oldStylePluginId) {
        events.emit('log', 'Plugin "' + pluginId + '" is not present in the project. Checking for legacy id "' + oldStylePluginId + '".');
        return installedPlugins.indexOf(oldStylePluginId) >= 0 ? oldStylePluginId : null;
    }

    if (pluginId.indexOf('cordova-plugin-') < 0) {
        return validatePluginId('cordova-plugin-' + pluginId, installedPlugins);
    }
}

function save(projectRoot, opts){
    var xml = cordova_util.projectConfig(projectRoot);
    var cfg = new ConfigParser(xml);

    // First, remove all pre-existing plugins from config.xml
    cfg.getPluginIdList().forEach(function(plugin){
        cfg.removePlugin(plugin);
    });

    // Then, save top-level plugins and their sources
    var jsonFile = path.join(projectRoot, 'plugins', 'fetch.json');
    var plugins;
    try {
        // It might be the case that fetch.json file is not yet existent.
        // for example: when we have never ran the command 'cordova plugin add foo' on the project
        // in that case, there's nothing to do except bubble up the error
        plugins = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    } catch (err) {
        return Q.reject(err.message);
    }

    Object.keys(plugins).forEach(function(pluginName){
        var plugin = plugins[pluginName];
        var pluginSource = plugin.source;

        // If not a top-level plugin, skip it, don't save it to config.xml
        if(!plugin.is_top_level){
            return;
        }

        var attribs = {name: pluginName};
        var spec = getSpec(pluginSource, projectRoot, pluginName);
        if (spec) {
            attribs.spec = spec;
        }

        var variables = getPluginVariables(plugin.variables);
        cfg.addPlugin(attribs, variables);
    });
    cfg.write();

    return Q.resolve();
}

function getPluginVariables(variables){
    var result = [];
    if(!variables){
        return result;
    }

    Object.keys(variables).forEach(function(pluginVar){
        result.push({name: pluginVar, value: variables[pluginVar]});
    });

    return result;
}

function getVersionFromConfigFile(plugin, cfg){
    var parsedSpec = pluginSpec.parse(plugin);
    var pluginEntry = cfg.getPlugin(parsedSpec.id);
    if (!pluginEntry && !parsedSpec.scope) {
        // If the provided plugin id is in the new format (e.g. cordova-plugin-camera), it might be stored in config.xml
        // under the old format (e.g. org.apache.cordova.camera), so check for that.
        var oldStylePluginId = pluginMapper[parsedSpec.id];
        if (oldStylePluginId) {
            pluginEntry = cfg.getPlugin(oldStylePluginId);
        }
    }
    return pluginEntry && pluginEntry.spec;
}

function list(projectRoot, hooksRunner, opts) {
    var pluginsList = [];
    return hooksRunner.fire('before_plugin_ls', opts)
    .then(function() {
        return getInstalledPlugins(projectRoot);
    })
    .then(function(plugins) {
        if (plugins.length === 0) {
            events.emit('results', 'No plugins added. Use `'+cordova_util.binname+' plugin add <plugin>`.');
            return;
        }
        var pluginsDict = {};
        var lines = [];
        var txt, p;
        for (var i=0; i<plugins.length; i++) {
            p = plugins[i];
            pluginsDict[p.id] = p;
            pluginsList.push(p.id);
            txt = p.id + ' ' + p.version + ' "' + (p.name || p.description) + '"';
            lines.push(txt);
        }
        // Add warnings for deps with wrong versions.
        for (var id in pluginsDict) {
            p = pluginsDict[id];
            for (var depId in p.deps) {
                var dep = pluginsDict[depId];
                //events.emit('results', p.deps[depId].version);
                //events.emit('results', dep != null);
                if (!dep) {
                    txt = 'WARNING, missing dependency: plugin ' + id +
                          ' depends on ' + depId +
                          ' but it is not installed';
                    lines.push(txt);
                } else if (!semver.satisfies(dep.version, p.deps[depId].version)) {
                    txt = 'WARNING, broken dependency: plugin ' + id +
                          ' depends on ' + depId + ' ' + p.deps[depId].version +
                          ' but installed version is ' + dep.version;
                    lines.push(txt);
                }
            }
        }
        events.emit('results', lines.join('\n'));
    })
    .then(function() {
        return hooksRunner.fire('after_plugin_ls', opts);
    })
    .then(function() {
        return pluginsList;
    });
}

function getInstalledPlugins(projectRoot) {
    var pluginsDir = path.join(projectRoot, 'plugins');
    // TODO: This should list based off of platform.json, not directories within plugins/
    var pluginInfoProvider = new PluginInfoProvider();
    return pluginInfoProvider.getAllWithinSearchPath(pluginsDir);
}

function saveToConfigXmlOn(config_json, options){
    options = options || {};
    var autosave =  config_json.auto_save_plugins || false;
    return autosave || options.save;
}

function parseSource(target, opts) {
    var url = require('url');
    var uri = url.parse(target);
    if (uri.protocol && uri.protocol != 'file:' && uri.protocol[1] != ':' && !target.match(/^\w+:\\/)) {
        return target;
    } else {
        var plugin_dir = cordova_util.fixRelativePath(path.join(target, (opts.subdir || '.')));
        if (fs.existsSync(plugin_dir)) {
            return target;
        }
    }
    return null;
}

function getSpec(pluginSource, projectRoot, pluginName) {
    if (pluginSource.hasOwnProperty('url') || pluginSource.hasOwnProperty('path')) {
        return pluginSource.url || pluginSource.path;
    }

    var version = null;
    var scopedPackage = null;
    if (pluginSource.hasOwnProperty('id')) {
        // Note that currently version is only saved here if it was explicitly specified when the plugin was added.
        var parsedSpec = pluginSpec.parse(pluginSource.id);
        version = parsedSpec.version;
        if (version) {
            version = versionString(version);
        }

        if (parsedSpec.scope) {
            scopedPackage = parsedSpec.package;
        }
    }

    if (!version) {
        // Fallback on getting version from the plugin folder, if it's there
        var pluginInfoProvider = new PluginInfoProvider();
        var dir = path.join(projectRoot, 'plugins', pluginName);

        try {
            // pluginInfoProvider.get() will throw if directory does not exist.
            var pluginInfo = pluginInfoProvider.get(dir);
            if (pluginInfo) {
                version = versionString(pluginInfo.version);
            }
        } catch (err) {
        }
    }

    if (scopedPackage) {
        version = scopedPackage + '@' + version;
    }

    return version;
}

function versionString(version) {
    var validVersion = semver.valid(version, true);
    if (validVersion) {
        return '~' + validVersion;
    }

    if (semver.validRange(version, true)) {
        // Return what we were passed rather than the result of the validRange() call, as that call makes modifications
        // we don't want, like converting '^1.2.3' to '>=1.2.3-0 <2.0.0-0'
        return version;
    }

    return null;
}

/**
 * Gets the version of a plugin that should be fetched for a given project based
 * on the plugin's engine information from NPM and the platforms/plugins installed
 * in the project. The cordovaDependencies object in the package.json's engines
 * entry takes the form of an object that maps plugin versions to a series of
 * constraints and semver ranges. For example:
 *
 *     { plugin-version: { constraint: semver-range, ...}, ...}
 *
 * Constraint can be a plugin, platform, or cordova version. Plugin-version
 * can be either a single version (e.g. 3.0.0) or an upper bound (e.g. <3.0.0)
 *
 * @param {string}  projectRoot     The path to the root directory of the project
 * @param {object}  pluginInfo      The NPM info of the plugin to be fetched (e.g. the
 *                                  result of calling `registry.info()`)
 * @param {string}  cordovaVersion  The semver version of cordova-lib
 *
 * @return {Promise}                A promise that will resolve to either a string
 *                                  if there is a version of the plugin that this
 *                                  project satisfies or null if there is not
 */
function getFetchVersion(projectRoot, pluginInfo, cordovaVersion) {
    // Figure out the project requirements
    if (pluginInfo.engines && pluginInfo.engines.cordovaDependencies) {
        var pluginList = getInstalledPlugins(projectRoot);
        var pluginMap = {};

        pluginList.forEach(function(plugin) {
            pluginMap[plugin.id] = plugin.version;
        });

        return cordova_util.getInstalledPlatformsWithVersions(projectRoot)
        .then(function(platformVersions) {
            return determinePluginVersionToFetch(
                pluginInfo,
                pluginMap,
                platformVersions,
                cordovaVersion);
        });
    } else {
        // If we have no engine, we want to fall back to the default behavior
        events.emit('verbose', 'npm info for ' + pluginInfo.name + ' did not contain any engine info. Fetching latest release');
        return Q(null);
    }
}

function findVersion(versions, version) {
    var cleanedVersion = semver.clean(version);
    for(var i = 0; i < versions.length; i++) {
        if(semver.clean(versions[i]) === cleanedVersion) {
            return versions[i];
        }
    }
    return null;
}

/*
 * The engine entry maps plugin versions to constraints like so:
 *  {
 *      '1.0.0' : { 'cordova': '<5.0.0' },
 *      '<2.0.0': {
 *          'cordova': '>=5.0.0',
 *          'cordova-ios': '~5.0.0',
 *          'cordova-plugin-camera': '~5.0.0'
 *      },
 *      '3.0.0' : { 'cordova-ios': '>5.0.0' }
 *  }
 *
 * See cordova-spec/plugin_fetch.spec.js for test cases and examples
 */
function determinePluginVersionToFetch(pluginInfo, pluginMap, platformMap, cordovaVersion) {
    var allVersions = pluginInfo.versions;
    var engine = pluginInfo.engines.cordovaDependencies;
    var name = pluginInfo.name;

    // Filters out pre-release versions
    var latest = semver.maxSatisfying(allVersions, '>=0.0.0');

    var versions = [];
    var upperBound = null;
    var upperBoundRange = null;
    var upperBoundExists = false;

    for(var version in engine) {
        if(semver.valid(semver.clean(version)) && !semver.gt(version, latest)) {
            versions.push(version);
        } else {
            // Check if this is an upperbound; validRange() handles whitespace
            var cleanedRange = semver.validRange(version);
            if(cleanedRange && UPPER_BOUND_REGEX.exec(cleanedRange)) {
                upperBoundExists = true;
                // We only care about the highest upper bound that our project does not support
                if(getFailedRequirements(engine[version], pluginMap, platformMap, cordovaVersion).length !== 0) {
                    var maxMatchingUpperBound = cleanedRange.substring(1);
                    if (maxMatchingUpperBound && (!upperBound || semver.gt(maxMatchingUpperBound, upperBound))) {
                        upperBound = maxMatchingUpperBound;
                        upperBoundRange = version;
                    }
                }
            } else {
                events.emit('verbose', 'Ignoring invalid version in ' + name + ' cordovaDependencies: ' + version + ' (must be a single version <= latest or an upper bound)');
            }
        }
    }

    // If there were no valid requirements, we fall back to old behavior
    if(!upperBoundExists && versions.length === 0) {
        events.emit('verbose', 'Ignoring ' + name + ' cordovaDependencies entry because it did not contain any valid plugin version entries');
        return null;
    }

    // Handle the lower end of versions by giving them a satisfied engine
    if(!findVersion(versions, '0.0.0')) {
        versions.push('0.0.0');
        engine['0.0.0'] = {};
    }

    // Add an entry after the upper bound to handle the versions above the
    // upper bound but below the next entry. For example: 0.0.0, <1.0.0, 2.0.0
    // needs a 1.0.0 entry that has the same engine as 0.0.0
    if(upperBound && !findVersion(versions, upperBound) && !semver.gt(upperBound, latest)) {
        versions.push(upperBound);
        var below = semver.maxSatisfying(versions, upperBoundRange);

        // Get the original entry without trimmed whitespace
        below = below ? findVersion(versions, below) : null;
        engine[upperBound] = below ? engine[below] : {};
    }

    // Sort in descending order; we want to start at latest and work back
    versions.sort(semver.rcompare);

    for(var i = 0; i < versions.length; i++) {
        if(upperBound && semver.lt(versions[i], upperBound)) {
            // Because we sorted in desc. order, if the upper bound we found
            // applies to this version (and thus the ones below) we can just
            // quit
            break;
        }

        var range = i? ('>=' + versions[i] + ' <' + versions[i-1]) : ('>=' + versions[i]);
        var maxMatchingVersion = semver.maxSatisfying(allVersions, range);

        if (maxMatchingVersion && getFailedRequirements(engine[versions[i]], pluginMap, platformMap, cordovaVersion).length === 0) {

            // Because we sorted in descending order, we can stop searching once
            // we hit a satisfied constraint
            if (maxMatchingVersion !== latest) {
                var failedReqs = getFailedRequirements(engine[versions[0]], pluginMap, platformMap, cordovaVersion);

                // Warn the user that we are not fetching latest
                listUnmetRequirements(name, failedReqs);
                events.emit('warn', 'Fetching highest version of ' + name + ' that this project supports: ' + maxMatchingVersion + ' (latest is ' + latest + ')');
            }
            return maxMatchingVersion;
        }
    }

    // No version of the plugin is satisfied. In this case, we fall back to
    // fetching the latest version, but also output a warning
    var latestFailedReqs = versions.length > 0 ? getFailedRequirements(engine[versions[0]], pluginMap, platformMap, cordovaVersion) : [];

    // If the upper bound is greater than latest, we need to combine its engine
    // requirements with latest to print out in the warning
    if(upperBound && semver.satisfies(latest, upperBoundRange)) {
        var upperFailedReqs = getFailedRequirements(engine[upperBoundRange], pluginMap, platformMap, cordovaVersion);
        upperFailedReqs.forEach(function(failedReq) {
            for(var i = 0; i < latestFailedReqs.length; i++) {
                if(latestFailedReqs[i].dependency === failedReq.dependency) {
                    // Not going to overcomplicate things and actually merge the ranges
                    latestFailedReqs[i].required += ' AND ' + failedReq.required;
                    return;
                }
            }

            // There is no req to merge it with
            latestFailedReqs.push(failedReq);
        });
    }

    listUnmetRequirements(name, latestFailedReqs);
    events.emit('warn', 'Current project does not satisfy the engine requirements specified by any version of ' + name + '. Fetching latest version of plugin anyway (may be incompatible)');

    // No constraints were satisfied
    return null;
}


function getFailedRequirements(reqs, pluginMap, platformMap, cordovaVersion) {
    var failed = [];

    for (var req in reqs) {
        if(reqs.hasOwnProperty(req) && typeof req === 'string' && semver.validRange(reqs[req])) {
            var badInstalledVersion = null;
            var trimmedReq = req.trim();

            if(pluginMap[trimmedReq] && !semver.satisfies(pluginMap[trimmedReq], reqs[req])) {
                badInstalledVersion = pluginMap[req];
            } else if(trimmedReq === 'cordova' && !semver.satisfies(cordovaVersion, reqs[req])) {
                badInstalledVersion = cordovaVersion;
            } else if(trimmedReq.indexOf('cordova-') === 0) {
                // Might be a platform constraint
                var platform = trimmedReq.substring(8);
                if(platformMap[platform] && !semver.satisfies(platformMap[platform], reqs[req])) {
                    badInstalledVersion = platformMap[platform];
                }
            }

            if(badInstalledVersion) {
                failed.push({
                    dependency: trimmedReq,
                    installed: badInstalledVersion.trim(),
                    required: reqs[req].trim()
                });
            }
        } else {
            events.emit('verbose', 'Ignoring invalid plugin dependency constraint ' + req + ':' + reqs[req]);
        }
    }

    return failed;
}

function listUnmetRequirements(name, failedRequirements) {
    events.emit('warn', 'Unmet project requirements for latest version of ' + name + ':');

    failedRequirements.forEach(function(req) {
        events.emit('warn', '    ' + req.dependency + ' (' + req.installed + ' in project, ' + req.required + ' required)');
    });
}
