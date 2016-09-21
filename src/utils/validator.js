const fs = require('fs')
const path = require('path')

/**
 * Verifies this is an Android project
 * @param {String} root directory path
 */
function checkAndroid(cwd) {
  return fs.existsSync(path.join(cwd, 'android/bin/gradlew'))
}

module.exports = {
  checkAndroid,
}
