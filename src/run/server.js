const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const app = express();
const detect = require('detect-port');
const ip = require('ip').address();
const path = require('path');
const utils = require('../utils');
const defaultPort = 8080;
let wss;

const logger = utils.logger;
const childprocess = require('child_process');

/**
 * Start js bundle server
 * @param {Object} options
 */
const startJSServer = () => {
  try {
    // start the web server
    utils.buildJS('serve', false);
  }
  catch (e) {
    logger.error(e);
  }
};

const startWsServer = (root) => {
  // put `dist` file into static server.
  app.use(express.static(path.join(root, 'dist')));
  return detect(defaultPort).then(open => {
    const host = `ws://${ip}:${open}`;
    const port = open;
    const server = http.createServer(app);
    wss = new WebSocket.Server({ server });

    // Broadcast to all.
    wss.broadcast = function broadcast (data) {
      wss.clients.forEach(function each (client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    };

    wss.on('connection', function connection (ws) {
      ws.on('message', function incoming (data) {
        // Broadcast to everyone else.
        wss.clients.forEach(function each (client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data);
          }
        });
      });
    });

    server.listen(port, () => {
      logger.info(`Hot Reload socket: ${host}`);
    });

    return {
      host,
      ip,
      port
    };
  });
};

module.exports = {
  startJSServer,
  startWsServer
};
