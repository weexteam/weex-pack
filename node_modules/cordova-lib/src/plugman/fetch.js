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

var shell   = require('shelljs'),
    fs      = require('fs'),
    url     = require('url'),
    underscore = require('underscore'),
    semver = require('semver'),
    PluginInfoProvider = require('cordova-common').PluginInfoProvider,
    plugins = require('./util/plugins'),
    CordovaError = require('cordova-common').CordovaError,
    events = require('cordova-common').events,
    metadata = require('./util/metadata'),
    path    = require('path'),
    Q       = require('q'),
    registry = require('./registry/registry'),
    pluginMappernto = require('cordova-registry-mapper').newToOld,
    pluginMapperotn = require('cordova-registry-mapper').oldToNew,
    pluginSpec      = require('../cordova/plugin_spec_parser'),
    fetch = require('cordova-fetch'),
    cordovaUtil = require('../cordova/util');

// Cache of PluginInfo objects for plugins in search path.
var localPlugins = null;

// possible options: link, subdir, git_ref, client, expected_id
// Returns a promise.
module.exports = fetchPlugin;
function fetchPlugin(plugin_src, plugins_dir, options) {
    // Ensure the containing directory exists.
    shell.mkdir('-p', plugins_dir);
    options = options || {};
    options.subdir = options.subdir || '.';
    options.searchpath = options.searchpath || [];
    if ( typeof options.searchpath === 'string' ) {
        options.searchpath = options.searchpath.split(path.delimiter);
    }

    var pluginInfoProvider = options.pluginInfoProvider || new PluginInfoProvider();

    // clone from git repository
    var uri = url.parse(plugin_src);

    // If the hash exists, it has the form from npm: http://foo.com/bar#git-ref[:subdir]
    // git-ref can be a commit SHA, a tag, or a branch
    // NB: No leading or trailing slash on the subdir.
    if (uri.hash) {
        var result = uri.hash.match(/^#([^:]*)(?::\/?(.*?)\/?)?$/);
        if (result) {
            if (result[1])
                options.git_ref = result[1];
            if (result[2])
                options.subdir = result[2];
            //if --fetch was used, throw error for subdirectories

            if(options.subdir) {
                events.emit('warn', 'support for subdirectories is deprecated and will be removed in Cordova@7');
                if (options.fetch) {
                    return Q.reject(new CordovaError('--fetch does not support subdirectories'));
                }
            }

            // Recurse and exit with the new options and truncated URL.
            var new_dir = plugin_src.substring(0, plugin_src.indexOf('#'));

            //skip the return if user asked for --fetch
            //cordova-fetch doesn't need to strip out git-ref
            if(!options.fetch) {
                return fetchPlugin(new_dir, plugins_dir, options);
            }
        }
    }

    return Q.when().then(function() {
        // If it looks like a network URL, git clone it
        // skip git cloning if user passed in --fetch flag
        if ( uri.protocol && uri.protocol != 'file:' && uri.protocol[1] != ':' && !plugin_src.match(/^\w+:\\/) && !options.fetch) {
            events.emit('log', 'Fetching plugin "' + plugin_src + '" via git clone');
            if (options.link) {
                events.emit('log', '--link is not supported for git URLs and will be ignored');
            }

            return plugins.clonePluginGit(plugin_src, plugins_dir, options)
            .fail(function (error) {
                var message = 'Failed to fetch plugin ' + plugin_src + ' via git.' +
                    '\nEither there is a connection problems, or plugin spec is incorrect:\n\t' + error;
                return Q.reject(new CordovaError(message));
            })
            .then(function(dir) {
                return {
                    pinfo: pluginInfoProvider.get(dir),
                    dest: dir,
                    fetchJsonSource: {
                        type: 'git',
                        url:  plugin_src,
                        subdir: options.subdir,
                        ref: options.git_ref
                    }
                };
            });
        }
        // If it's not a network URL, it's either a local path or a plugin ID.
        var plugin_dir = cordovaUtil.fixRelativePath(path.join(plugin_src, options.subdir));

        return Q.when().then(function() {
            if (fs.existsSync(plugin_dir)) {
                return {
                    pinfo: pluginInfoProvider.get(plugin_dir),
                    fetchJsonSource: {
                        type: 'local',
                        path: plugin_dir
                    }
                };
            }
            // If there is no such local path, it's a plugin id or id@versionspec.
            // First look for it in the local search path (if provided).
            var pinfo = findLocalPlugin(plugin_src, options.searchpath, pluginInfoProvider);
            if (pinfo) {
                events.emit('verbose', 'Found ' + plugin_src + ' at ' + pinfo.dir);
                return {
                    pinfo: pinfo,
                    fetchJsonSource: {
                        type: 'local',
                        path: pinfo.dir
                    }
                };
            } else if ( options.noregistry ) {
                return Q.reject(new CordovaError(
                    'Plugin ' + plugin_src + ' not found locally. ' +
                    'Note, plugin registry was disabled by --noregistry flag.'
                ));
            }
            // If not found in local search path, fetch from the registry.
            var parsedSpec = pluginSpec.parse(plugin_src);
            var newID = parsedSpec.scope ? null : pluginMapperotn[parsedSpec.id];
            if(newID) {
                plugin_src = newID;
                if (parsedSpec.version) {
                    plugin_src += '@' + parsedSpec.version;
                }
            }
            var P, skipCopyingPlugin;
            plugin_dir = path.join(plugins_dir, parsedSpec.id);
            // if the plugin has already been fetched, use it.
            if (fs.existsSync(plugin_dir)) {
                P = Q(plugin_dir);
                skipCopyingPlugin = true;
            } else {
                // if the plugin alias has already been fetched, use it.
                var alias = parsedSpec.scope ? null : pluginMappernto[parsedSpec.id] || newID;
                if (alias && fs.existsSync(path.join(plugins_dir, alias))) {
                    events.emit('warn', 'Found '+alias+' is already fetched. Skipped fetching ' + parsedSpec.id);
                    P = Q(path.join(plugins_dir, alias));
                    skipCopyingPlugin = true;
                } else {
                    if (newID) {
                        events.emit('warn', 'Notice: ' + parsedSpec.id + ' has been automatically converted to ' + newID + ' to be fetched from npm. This is due to our old plugins registry shutting down.');
                    }
                    //use cordova-fetch if --fetch was passed in
                    if(options.fetch) {
                        var projectRoot = path.join(plugins_dir, '..');
                        //Plugman projects need to go up two directories to reach project root. 
                        //Plugman projects have an options.projectRoot variable
                        if(options.projectRoot) {
                            projectRoot = options.projectRoot;
                        }
                        P = fetch(plugin_src, projectRoot, options); 
                    } else {
                        P = registry.fetch([plugin_src]);
                    }
                    skipCopyingPlugin = false;
                }
            }
            return P
            .fail(function (error) {
                var message = 'Failed to fetch plugin ' + plugin_src + ' via registry.' +
                    '\nProbably this is either a connection problem, or plugin spec is incorrect.' +
                    '\nCheck your connection and plugin name/version/URL.' +
                    '\n' + error;
                return Q.reject(new CordovaError(message));
            })
            .then(function(dir) {
                return {
                    pinfo: pluginInfoProvider.get(dir),
                    fetchJsonSource: {
                        type: 'registry',
                        id: plugin_src
                    },
                    skipCopyingPlugin: skipCopyingPlugin
                };
            });
        }).then(function(result) {
            options.plugin_src_dir = result.pinfo.dir;
            var P;
            if (result.skipCopyingPlugin) {
                P = Q(options.plugin_src_dir);
            } else {
                P = Q.when(copyPlugin(result.pinfo, plugins_dir, options.link && result.fetchJsonSource.type == 'local'));
            }
            return P.then(function(dir) {
                result.dest = dir;
                return result;
            });
        });
    }).then(function(result){
        checkID(options.expected_id, result.pinfo);
        var data = { source: result.fetchJsonSource };
        data.is_top_level = options.is_top_level;
        data.variables = options.variables || {};
        metadata.save_fetch_metadata(plugins_dir, result.pinfo.id, data);
        return result.dest;
    });
}

// Helper function for checking expected plugin IDs against reality.
function checkID(expectedIdAndVersion, pinfo) {
    if (!expectedIdAndVersion) return;

    var parsedSpec = pluginSpec.parse(expectedIdAndVersion);

    if (parsedSpec.id != pinfo.id) {
        var alias = parsedSpec.scope ? null : pluginMappernto[parsedSpec.id] || pluginMapperotn[parsedSpec.id];
        if (alias !== pinfo.id) {
            throw new Error('Expected plugin to have ID "' + parsedSpec.id + '" but got "' + pinfo.id + '".');
        }
    }
    if (parsedSpec.version && !semver.satisfies(pinfo.version, parsedSpec.version)) {
        throw new Error('Expected plugin ' + pinfo.id + ' to satisfy version "' + parsedSpec.version + '" but got "' + pinfo.version + '".');
    }
}

// Note, there is no cache invalidation logic for local plugins.
// As of this writing loadLocalPlugins() is never called with different
// search paths and such case would not be handled properly.
function loadLocalPlugins(searchpath, pluginInfoProvider) {
    if (localPlugins) {
        // localPlugins already populated, nothing to do.
        // just in case, make sure it was loaded with the same search path
        if ( !underscore.isEqual(localPlugins.searchpath, searchpath) ) {
            var msg =
                'loadLocalPlugins called twice with different search paths.' +
                'Support for this is not implemented.';
            throw new Error(msg);
        }
        return;
    }

    // Populate localPlugins object.
    localPlugins = {};
    localPlugins.searchpath = searchpath;
    localPlugins.plugins = {};

    searchpath.forEach(function(dir) {
        var ps = pluginInfoProvider.getAllWithinSearchPath(dir);
        ps.forEach(function(p) {
            var versions = localPlugins.plugins[p.id] || [];
            versions.push(p);
            localPlugins.plugins[p.id] = versions;
        });
    });
}


// If a plugin is fund in local search path, return a PluginInfo for it.
// Ignore plugins that don't satisfy the required version spec.
// If several versions are present in search path, return the latest.
// Examples of accepted plugin_src strings:
//      org.apache.cordova.file
//      org.apache.cordova.file@>=1.2.0
function findLocalPlugin(plugin_src, searchpath, pluginInfoProvider) {
    loadLocalPlugins(searchpath, pluginInfoProvider);
    var parsedSpec = pluginSpec.parse(plugin_src);
    var versionspec = parsedSpec.version || '*';

    var latest = null;
    var versions = localPlugins.plugins[parsedSpec.id];

    if (!versions) return null;

    versions.forEach(function(pinfo) {
        // Ignore versions that don't satisfy the the requested version range.
        // Ignore -dev suffix because latest semver versions doesn't handle it properly (CB-9421)
        if (!semver.satisfies(pinfo.version.replace(/-dev$/, ''), versionspec)) {
            return;
        }
        if (!latest) {
            latest = pinfo;
            return;
        }
        if (semver.gt(pinfo.version, latest.version)) {
            latest = pinfo;
        }

    });
    return latest;
}


// Copy or link a plugin from plugin_dir to plugins_dir/plugin_id.
// if alternative ID of plugin exists in plugins_dir/plugin_id, skip copying
function copyPlugin(pinfo, plugins_dir, link) {

    var plugin_dir = pinfo.dir;
    var dest = path.join(plugins_dir, pinfo.id);
    var altDest;

    //check if alternative id already exists in plugins directory
    if(pluginMapperotn[pinfo.id]) {
        altDest = path.join(plugins_dir, pluginMapperotn[pinfo.id]);
    } else if(pluginMappernto[pinfo.id]) {
        altDest = path.join(plugins_dir, pluginMappernto[pinfo.id]);
    }

    if(fs.existsSync(altDest)) {
        events.emit('log', pinfo.id + '" will not be added because its alternate id "' + altDest + '" is already present.');
        return altDest;
    }

    shell.rm('-rf', dest);

    if(!link && dest.indexOf(path.resolve(plugin_dir)+path.sep) === 0) {

        if(/^win/.test(process.platform)) {
            /*
                [CB-10423]
                This is a special case. On windows we cannot create a symlink unless we are run as admin
                The error that we have is because src contains dest, so we end up with a recursive folder explosion
                This code avoids copy the one folder that will explode, and allows plugins to contain a demo project
                and to install the plugin via `cordova plugin add ../`
            */
            var resolvedSrcPath = path.resolve(plugin_dir);
            var filenames = fs.readdirSync(resolvedSrcPath);
            var relPath = path.relative(resolvedSrcPath,dest);
            var relativeRootFolder = relPath.split('\\')[0];
            filenames.splice(filenames.indexOf(relativeRootFolder),1);
            shell.mkdir('-p', dest);
            events.emit('verbose', 'Copying plugin "' + resolvedSrcPath + '" => "' + dest + '"');
            events.emit('verbose', 'Skipping folder "' + relativeRootFolder + '"');

            filenames.forEach(function(elem) {
                shell.cp('-R', path.join(resolvedSrcPath,elem) , dest);
            });
            return dest;
        }
        else {
            events.emit('verbose', 'Copy plugin destination is child of src. Forcing --link mode.');
            link = true;
        }
    }

    if (link) {
        var isRelativePath = plugin_dir.charAt(1) != ':' && plugin_dir.charAt(0) != path.sep;
        var fixedPath = isRelativePath ? path.join(path.relative(plugins_dir, process.env.PWD || process.cwd()), plugin_dir) : plugin_dir;
        events.emit('verbose', 'Linking "' + dest + '" => "' + fixedPath + '"');
        fs.symlinkSync(fixedPath, dest, 'dir');
    } else {
        shell.mkdir('-p', dest);
        events.emit('verbose', 'Copying plugin "' + plugin_dir + '" => "' + dest + '"');
        shell.cp('-R', path.join(plugin_dir, '*') , dest);
    }
    return dest;
}
