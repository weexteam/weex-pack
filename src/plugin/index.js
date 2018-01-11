const uninstall = require('./uninstall');
const create = require('./create');

const {
    install,
    installForNewPlatform
} = require('./install');

module.exports = {
  install,
  installForNewPlatform,
  uninstall,
  create
};
