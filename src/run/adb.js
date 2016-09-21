const { execSync } = require('child_process')

/**
 * Parses the output of the 'adb devices' command
 * @param {String} result
 * @return {Array<string>} devices
 */
function parseDevicesResult(result) {
  if (!result) {
    return []
  }

  const devices = []
  const lines = result.trim().split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    let words = lines[i].split(/[ ,\t]+/).filter(w => w !== '')

    if (words[1] === 'device') {
      devices.push(words[0])
    }
  }

  return devices
}

/**
 * Executes the commands needed to get a list of devices from ADB
 * @return {Array<string>} devices
 */
function getDevices() {
  try {
    const devicesResult = execSync('adb devices')
    return parseDevicesResult(devicesResult.toString())
  } catch (e) {
    return []
  }
}

module.exports = {
  parseDevicesResult,
  getDevices,
}
