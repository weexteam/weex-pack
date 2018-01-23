'use strict';

var exec = require('child_process').execSync;

var gituser = function gituser() {
  var name = void 0;
  var email = void 0;

  try {
    name = exec('git config --get user.name');
    email = exec('git config --get user.email');
  } catch (e) {}

  name = name && JSON.stringify(name.toString().trim()).slice(1, -1);
  email = email && ' <' + email.toString().trim() + '>';
  return (name || '') + (email || '');
};

module.exports = {
  gituser: gituser
};