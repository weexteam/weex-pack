const child_process = require('child_process')

/**
 * Start js bundle server
 * @param {Object} options
 */
function startJSServer() {
  try {
    console.log(child_process.execSync(`open ./start`, {encoding: 'utf8'}))
  } catch(e) {
    console.log(e)
  }
}

module.exports = startJSServer
