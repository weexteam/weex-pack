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

var create = require('weexpack-create');
var _ = require('underscore');
var fs = require('fs');
var rm = require('rimraf').sync;
var path = require('path');
var ora = require('ora');
var utils = require('../utils');
var events = utils.events;

module.exports = function (dir, dirname, template, extEvents, options) {
  var tmp = path.resolve(dir);
  if (fs.existsSync(tmp)) {
    var spinner = ora('Remove ' + tmp + ' ...').start();
    rm(tmp);
    spinner.stop();
  }
  if (extEvents) {
    return create(dir, dirname, template, extEvents, options);
  } else {
    return create(dir, dirname, template, events, options);
  }
};