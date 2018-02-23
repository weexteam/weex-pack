'use strict';

var WebSocket = require('ws');
var express = require('express');
var http = require('http');
var app = express();
var detect = require('detect-port');
var ip = require('ip').address();
var path = require('path');
var utils = require('../utils');
var defaultPort = 8080;
var wss = void 0;

var logger = utils.logger;
var childprocess = require('child_process');

/**
 * Start js bundle server
 * @param {Object} options
 */
var startJSServer = function startJSServer() {
  try {
    // start the web server
    utils.buildJS('serve', false);
  } catch (e) {
    logger.error(e);
  }
};

var startWsServer = function startWsServer(root) {
  // put `dist` file into static server.
  app.use(express.static(path.join(root, 'dist')));
  return detect(defaultPort).then(function (open) {
    var host = 'ws://' + ip + ':' + open;
    var port = open;
    var server = http.createServer(app);
    wss = new WebSocket.Server({ server: server });

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

    server.listen(port, function () {
      logger.info('Hot Reload socket: ' + host);
    });

    return {
      host: host,
      ip: ip,
      port: port
    };
  });
};

module.exports = {
  startJSServer: startJSServer,
  startWsServer: startWsServer
};