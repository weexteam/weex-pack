'use strict';

var buildAndroid = require('./android');
var buildIOS = require('./ios');
var buildWeb = require('./web');

module.exports = {
  buildAndroid: buildAndroid,
  buildIOS: buildIOS,
  buildWeb: buildWeb
};