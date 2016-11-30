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

var cordova_util = require('./util'),
    ConfigParser = require('cordova-common').ConfigParser,
    path         = require('path'),
    Q            = require('q'),
    fs           = require('fs'),
    events       = require('cordova-common').events,
    cordova      = require('./cordova'),
    semver      = require('semver'),
    promiseutil = require('../util/promise-util');

exports.installPluginsFromConfigXML = installPluginsFromConfigXML;
exports.installPlatformsFromConfigXML = installPlatformsFromConfigXML;


function installPlatformsFromConfigXML(platforms, opts) {
    events.emit('verbose', 'Checking config.xml for saved platforms that haven\'t been added to the project');

    var projectHome = cordova_util.cdProjectRoot();
    var configPath = cordova_util.projectConfig(projectHome);
    var cfg = new ConfigParser(configPath);

    var engines = cfg.getEngines(projectHome);
    var installAllPlatforms = !platforms || platforms.length === 0;

    var targets = engines.map(function(engine) {
        var platformPath = path.join(projectHome, 'platforms', engine.name);
        var platformAlreadyAdded = fs.existsSync(platformPath);

        //if no platforms are specified we add all.
        if ((installAllPlatforms || platforms.indexOf(engine.name) > -1) && !platformAlreadyAdded) {
            var t = engine.name;
            if (engine.spec) {
                t += '@' + engine.spec;
            }
            return t;
        }
    });

    if (!targets || !targets.length) {
        return Q('No platforms found in config.xml that haven\'t been added to the project');
    }


    // Run `platform add` for all the platforms separately
    // so that failure on one does not affect the other.

    // CB-9278 : Run `platform add` serially, one platform after another
    // Otherwise, we get a bug where the following line: https://github.com/apache/cordova-lib/blob/0b0dee5e403c2c6d4e7262b963babb9f532e7d27/cordova-lib/src/util/npm-helper.js#L39
    // gets executed simultaneously by each platform and leads to an exception being thrown
    return promiseutil.Q_chainmap_graceful(targets, function(target) {
        if (target) {
            events.emit('log', 'Discovered platform \"' + target + '\" in config.xml. Adding it to the project');
            return cordova.raw.platform('add', target, opts);
        }
        return Q();
    }, function(err) {
        events.emit('warn', err);
    });
}

//returns a Promise
function installPluginsFromConfigXML(args) {
    events.emit('verbose', 'Checking config.xml for saved plugins that haven\'t been added to the project');

    //Install plugins that are listed on config.xml
    var projectRoot = cordova_util.cdProjectRoot();
    var configPath = cordova_util.projectConfig(projectRoot);
    var cfg = new ConfigParser(configPath);
    var plugins_dir = path.join(projectRoot, 'plugins');

    // Get all configured plugins
    var plugins = cfg.getPluginIdList();
    if (0 === plugins.length) {
        return Q('No plugins found in config.xml that haven\'t been added to the project');
    }


    // Intermediate variable to store current installing plugin name
    // to be able to create informative warning on plugin failure
    var pluginName;

    // CB-9560 : Run `plugin add` serially, one plugin after another
    // We need to wait for the plugin and its dependencies to be installed
    // before installing the next root plugin otherwise we can have common
    // plugin dependencies installed twice which throws a nasty error.
    return promiseutil.Q_chainmap_graceful(plugins, function(featureId) {
        var pluginPath = path.join(plugins_dir, featureId);
        if (fs.existsSync(pluginPath)) {
            // Plugin already exists
            return Q();
        }
        events.emit('log', 'Discovered plugin "' + featureId + '" in config.xml. Adding it to the project');
        var pluginEntry = cfg.getPlugin(featureId);

        // Install from given URL if defined or using a plugin id. If spec isn't a valid version or version range,
        // assume it is the location to install from.
        var pluginSpec = pluginEntry.spec;
        pluginName = pluginEntry.name;

        // CB-10761 If plugin spec is not specified, use plugin name
        var installFrom = pluginSpec || pluginName;
        if (pluginSpec && semver.validRange(pluginSpec, true))
            installFrom = pluginName + '@' + pluginSpec;

        // Add feature preferences as CLI variables if have any
        var options = {
            cli_variables: pluginEntry.variables,
            searchpath: args.searchpath,
            fetch: args.fetch || false,
            save: args.save || false
        };
        var plugin = require('./plugin');
        return plugin('add', installFrom, options);
    }, function (error) {
        // CB-10921 emit a warning in case of error
        var msg = 'Failed to restore plugin \"' + pluginName + '\" from config.xml. ' +
            'You might need to try adding it again. Error: ' + error;
        events.emit('warn', msg);
    });
}
