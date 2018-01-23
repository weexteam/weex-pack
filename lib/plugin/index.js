'use strict';

var uninstall = require('./uninstall');
var create = require('./create');

var _require = require('./install'),
    install = _require.install,
    installForNewPlatform = _require.installForNewPlatform;

module.exports = {
  install: install,
  installForNewPlatform: installForNewPlatform,
  uninstall: uninstall,
  create: create
};