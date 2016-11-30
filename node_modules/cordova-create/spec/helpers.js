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

var path         = require('path'),
    fs           = require('fs'),
    shell        = require('shelljs'),
    os           = require('os'),
    ConfigParser = require('cordova-common').ConfigParser;

// Just use Android everywhere; we're mocking out any calls to the `android` binary.
module.exports.testPlatform = 'android';

function getConfigPath(dir) {
    // if path ends with 'config.xml', return it
    if (dir.indexOf('config.xml') == dir.length - 10) {
        return dir;
    }
    // otherwise, add 'config.xml' to the end of it
    return path.join(dir, 'config.xml');
}

module.exports.tmpDir = function (subdir) {
    var dir = path.join(os.tmpdir(), 'e2e-test');
    if (subdir) {
        dir = path.join(dir, subdir);
    }
    if(fs.existsSync(dir)) {
        shell.rm('-rf', dir);
    }
    shell.mkdir('-p', dir);
    return dir;
};

// Returns the platform that should be used for testing on this host platform.
/*
var host = os.platform();
if (host.match(/win/)) {
    module.exports.testPlatform = 'wp8';
} else if (host.match(/darwin/)) {
    module.exports.testPlatform = 'ios';
} else {
    module.exports.testPlatform = 'android';
}
*/

module.exports.setEngineSpec = function (appPath, engine, spec) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath);

    parser.removeEngine(engine);
    parser.addEngine(engine, spec);
    parser.write();
};

module.exports.getEngineSpec = function (appPath, engine) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath),
        engines = parser.getEngines();

    for (var i = 0; i < engines.length; i++) {
        if (engines[i].name === module.exports.testPlatform) {
            return engines[i].spec;
        }
    }
    return null;
};

module.exports.removeEngine = function (appPath, engine) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath);

    parser.removeEngine(module.exports.testPlatform);
    parser.write();
};

module.exports.setPluginSpec = function (appPath, plugin, spec) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath),
        p = parser.getPlugin(plugin),
        variables = [];

    if (p) {
        parser.removePlugin(p.name);
        if (p.variables.length && p.variables.length > 0) {
            variables = p.variables;
        }
    }

    parser.addPlugin({ 'name': plugin, 'spec': spec }, variables);
    parser.write();
};

module.exports.getPluginSpec = function (appPath, plugin) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath),
        p = parser.getPlugin(plugin);

    if (p) {
        return p.spec;
    }
    return null;
};

module.exports.getPluginVariable = function (appPath, plugin, variable) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath),
        p = parser.getPlugin(plugin);

    if (p && p.variables) {
        return p.variables[variable];
    }
    return null;
};

module.exports.removePlugin = function (appPath, plugin) {
    appPath = getConfigPath(appPath);
    var parser = new ConfigParser(appPath);

    parser.removePlugin(plugin);
    parser.write();
};

module.exports.getConfigContent = function (appPath) {
    var configFile = path.join(appPath, 'config.xml');
    return fs.readFileSync(configFile, 'utf-8');
};

module.exports.writeConfigContent = function (appPath, configContent) {
    var configFile = path.join(appPath, 'config.xml');
    fs.writeFileSync(configFile, configContent, 'utf-8');
};

// Add the toExist matcher.
beforeEach(function () {
    jasmine.addMatchers({
        'toExist': function () {
            return {
                compare: function (testPath) {

                    var result = {};
                    result.pass = fs.existsSync(testPath);

                    if(result.pass) {
                        result.message = 'Expected file ' + testPath + ' to exist.';
                    } else {
                        result.message = 'Expected file ' + testPath + ' to not exist.';
                    }

                    return result

                }
            }
        }
    });
});

