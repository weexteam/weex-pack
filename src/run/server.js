const child_process = require('child_process')

/**
 * Start js bundle server
 * @param {Object} options
 */
function startJSServer() {
  let occupied = true;
  try {

    child_process.execSync('lsof -i :8080', {encoding: 'utf8'});
    //console.log(child_process.execSync(`open ./start`, {encoding: 'utf8'}))
  } catch (e) {
    occupied = false
  }
  if (!occupied) {
    try {
      console.log(child_process.execSync(`open ./start`, {encoding: 'utf8'}))
    }
    catch (e){
      console.log(e);
    }
  }
}

module.exports = startJSServer
startJSServer();
