"use strict";

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

var platforms = {
    ios: {
        "hostos": ["darwin"],
        "parser_file": "../cordova/metadata/ios_parser",
        "handler_file": "../plugman/platforms/ios",
        "url": "https://github.com/weexteam/weexpack-iOS.git?",
        "version": "^4.1.6",
        "apiCompatibleSince": "4.0.",
        "deprecated": false

    },

    android: {
        "parser_file": "../cordova/metadata/android_parser",
        "handler_file": "../plugman/platforms/android",
        "url": "https://github.com/weexteam/weexpack-android",
        "version": "^6.3.8",
        "apiCompatibleSince": "5.0.0",
        "deprecated": false
    }
};

module.exports = platforms;