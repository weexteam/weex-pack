'use strict';

var runAndroid = require('./android');
var runIOS = require('./ios');
var runWeb = require('./web');

module.exports = {
  runAndroid: runAndroid,
  runIOS: runIOS,
  runWeb: runWeb
};