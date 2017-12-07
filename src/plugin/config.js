const path = require('path');

const configs = {
  rootPath: path.join(process.cwd(), './plugins'),
  filename: 'plugin.json',
  defaultConfig: {
    ios: [],
    android: [],
    browser: []
  }
}

module.exports = Object.assign({}, configs);