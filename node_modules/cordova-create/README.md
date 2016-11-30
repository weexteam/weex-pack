<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->

[![Build status](https://ci.appveyor.com/api/projects/status/a00hk739gm700dk4?svg=true)](https://ci.appveyor.com/project/Humbedooh/cordova-create) 
[![Build Status](https://travis-ci.org/apache/cordova-create.svg?branch=master)](https://travis-ci.org/apache/cordova-create)

# cordova-create

This module is used for creating cordova style projects. It also incudes support for [cordova templates](http://cordova.apache.org/docs/en/latest/guide/cli/template.html). It can fetch templates from npm and git.

## Usage:
:
```
var create = require('cordova-create');

create(dir, id, name, cfg, extEvents);
```

 `dir` - directory where the project will be created. Required.
 `id` - app id. Required (but can be "undefined").
 `name` - app name. Required (but can be "undefined"). 
 `cfg` - extra config to be saved in .cordova/config.json Required (but can be "{}").
 `extEvents` - An EventEmitter instance that will be used for logging purposes. Required (but can be "undefined").

An example of cfg which would fetch a cordova template from npm (or git):

```
var cfg = {
    lib: {
        www: {
            template: true,
            url: 'cordova-app-hello-world',
            version: ''
        }
    }
};
```
