'use strict';

var path = require('path');

var configs = {
  root: process.cwd(),
  rootPath: path.join(process.cwd(), './plugins'),
  filename: 'plugins.json',
  androidPath: path.join(process.cwd(), './platforms/android'),
  iosPath: path.join(process.cwd(), './platforms/ios'),
  androidConfigFilename: '.weex_plugin.json',
  defaultConfig: {
    ios: [],
    web: [],
    android: []
  }
};

module.exports = Object.assign({}, configs);