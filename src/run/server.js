const child_process = require('child_process');

/**
 * Start js bundle server
 * @param {Object} options
 */
function startJSServer () {
  try {
    child_process.exec(process.platform === 'win32' ? 'start start.bat' : `open ./start`, { encoding: 'utf8' });
  }
  catch (e) {
    console.error(e);
  }
}

module.exports = startJSServer;
