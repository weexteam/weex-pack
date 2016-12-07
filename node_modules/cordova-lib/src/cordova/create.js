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

var create = require('cordova-create');
var events = require('cordova-common').events;

module.exports = function(dir, optionalId, optionalName, cfg, extEvents){
    if (extEvents) {
        return create(dir, optionalId, optionalName, cfg, extEvents);
    } else {
        return create(dir, optionalId, optionalName, cfg, events);
    }
};

/* If we do not pass in extEvents, then CordovaLogger will set up the listeners
inside of cordova-create. That means we'll log everything always.  By passing in
a dummy cordova-common.events EventEmitter with no listeners, then cordova-lib
won't log in the create tests. When cordova-cli uses cordova-lib, it will setup
the listeners for events using CordovaLogger.  */
