const path = require('path');

const configs = {
  rootPath: path.join(process.cwd(), './plugins'),
  filename: 'plugin.json',
  androidPath: path.join(process.cwd(), './platforms/android'),
  androidConfigFilename: '.weex_plugin.json',
  defaultConfig: {
    ios: [],
    web: [],    
    android: []
  }
}

module.exports = Object.assign({}, configs);