const WebSocket = require('ws');
const detect = require('detect-port');
const ip = require('ip').address();
const defaultPort = 8080;
let wss;

const logger = require('weexpack-common').CordovaLogger.get();
const child_process = require('child_process');

/**
 * Start js bundle server
 * @param {Object} options
 */
const startJSServer = () => {
  try {
    child_process.exec(process.platform === 'win32' ? 'start start.bat' : `open ./start`, { encoding: 'utf8' });
  }
  catch (e) {
    console.error(e);
  }
}

const startWsServer = () => {
  return detect(defaultPort).then(open => {
    const host = `ws://${ip}:${open}`;
    
    wss = new WebSocket.Server({ port: defaultPort })

    // Broadcast to all.
    wss.broadcast = function broadcast(data) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    };

    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(data) {
        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      });
    });

    logger.info(`Hot Reload socket: ${host}`)
    return host;
  })
}

module.exports = {
  startJSServer,
  startWsServer
};
