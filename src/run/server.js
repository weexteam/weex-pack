const child_process = require('child_process')

/**
 * Start js bundle server
 * @param {Object} options
 */
function startJSServer() {
  let occupied = true;
  try {

    child_process.execSync(process.platform==='win32'?'netstat -aon|findstr "8080"':'lsof -i :8080', {encoding: 'utf8'});
    //console.log(child_process.execSync(`open ./start`, {encoding: 'utf8'}))
  } catch (e) {
    occupied = false
  }
  if (!occupied) {
    try {
        child_process.exec(process.platform==='win32'?'start start.bat':`open ./start`, {encoding: 'utf8'})
    }
    catch (e){
      console.error(e);
    }

  }
  return occupied;
}

module.exports = startJSServer
