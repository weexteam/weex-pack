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

const path = require('path');
const fs = require('fs');
const url = require('url');
const shell = require('shelljs');

// Map of projectRoot -> JSON
const configCache = {};
let autoPersist = true;

function config (projectRoot, opts) {
  const json = config.read(projectRoot);
  for (const p in opts) {
    json[p] = opts[p];
  }
  if (autoPersist) {
    config.write(projectRoot, json);
  }
  else {
    configCache[projectRoot] = JSON.stringify(json);
  }
  return json;
}

config.getAutoPersist = function () {
  return autoPersist;
};

config.setAutoPersist = function (value) {
  autoPersist = value;
};

config.read = function getConfig (projectRoot) {
  let data = configCache[projectRoot];
  if (!data) {
    const configPath = path.join(projectRoot, '.wx', 'config.json');
    if (!fs.existsSync(configPath)) {
      data = '{}';
    }
    else {
      data = fs.readFileSync(configPath, 'utf-8');
    }
  }
  configCache[projectRoot] = data;
  return JSON.parse(data);
};

config.write = function setConfig (projectRoot, json) {
  const configPath = path.join(projectRoot, '.wx', 'config.json');
  const contents = JSON.stringify(json, null, 4);
  configCache[projectRoot] = contents;
    // Don't write the file for an empty config.
  if (contents !== '{}' || fs.existsSync(configPath)) {
    shell.mkdir('-p', path.join(projectRoot, '.wx'));
    fs.writeFileSync(configPath, contents, 'utf-8');
  }
  return json;
};

config.hasCustomPath = function (projectRoot, platform) {
  const json = config.read(projectRoot);
  if (json.lib && json.lib[platform]) {
    const uri = url.parse(json.lib[platform].url || json.lib[platform].uri);
    if (!(uri.protocol)) return uri.path;
    else if (uri.protocol && uri.protocol[1] === ':') return uri.href;
  }
  return false;
};

module.exports = config;
