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

// For now expose plugman and cordova just as they were in the old repos


function addProperty(obj, property, modulePath) {
    // Add properties as getter to delay load the modules on first invocation
    Object.defineProperty(obj, property, {
        configurable: true,
        get: function () {
            var module = require(modulePath);
            // We do not need the getter any more
            obj[property] = module;
            return module;
        }
    });
}

exports = module.exports = {
    set binname(name) {
        this.cordova.binname = name;
    },
    get binname() {
        return this.cordova.binname;
    },
    get events() { return require('cordova-common').events },
    get configparser() { return require('cordova-common').ConfigParser },
    get PluginInfo() { return require('cordova-common').PluginInfo },
    get CordovaError() { return require('cordova-common').CordovaError }

};

addProperty(module.exports, 'plugman', './src/plugman/plugman');
addProperty(module.exports, 'cordova', './src/cordova/cordova');
addProperty(module.exports, 'cordova_platforms', './src/platforms/platforms');