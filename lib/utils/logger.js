'use strict';

var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;

var events = new EventEmitter();
var LOGLEVELS = ['verbose', 'log', 'info', 'warn', 'error', 'success'];

// global var
var LOGLEVEL = {
  VERBOSE: 'verbose',
  LOG: 'log',
  WARN: 'warn',
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success'
};

var SEVERITY = {
  verbose: 1000,
  log: 2000,
  warn: 3000,
  info: 3000,
  error: 5000,
  success: 10000
};

var LOGCOLOR = {
  verbose: 'white',
  log: 'white',
  warn: 'yellow',
  info: 'white',
  error: 'red',
  success: 'green'
};

var PREFIX = '[weex]';
var SEP = ':';

var DEFAULT_LOGLEVEL = LOGLEVEL.LOG;

var formatError = function formatError(error, isVerbose) {
  var message = '';
  if (error instanceof Error) {
    if (isVerbose) {
      message = error.stack;
    } else {
      message = error.message;
    }
  } else {
    // Plain text error message
    message = error;
  }
  if (typeof message === 'string' && message.toUpperCase().indexOf('ERROR:') !== 0) {
    // Needed for backward compatibility with external tools
    message = 'Error: ' + message;
  }
  return message;
};

var fill = function fill(num) {
  return num > 9 ? num : '0' + num;
};

var log = function log(loglevel) {
  return function (message) {
    var isVerbose = DEFAULT_LOGLEVEL === LOGLEVEL.VERBOSE;
    if (!SEVERITY[DEFAULT_LOGLEVEL] || SEVERITY[DEFAULT_LOGLEVEL] > SEVERITY[loglevel]) {
      // return instance to allow to chain calls
      return;
    }
    if (message instanceof Error || isVerbose) {
      message = formatError(message, isVerbose);
    }
    var color = LOGCOLOR[loglevel];
    var time = void 0;
    var prefix = void 0;
    var sep = void 0;
    if (SEVERITY[loglevel] >= SEVERITY[LOGLEVEL.INFO]) {
      time = new Date();
      prefix = chalk.gray(fill(time.getHours()) + ':' + fill(time.getMinutes()) + ':' + fill(time.getSeconds()));
      sep = ':';
      console.log(chalk.grey(prefix), sep, chalk[color](message));
    } else {
      console.log(chalk[color](message));
    }
  };
};

var subscribe = function subscribe(event) {
  if (!(event instanceof EventEmitter)) {
    throw new Error('Subscribe method only accepts an EventEmitter instance as argument');
  }
  event.on('verbose', log('verbose')).on('log', log('log')).on('info', log('info')).on('warn', log('warn')).on('error', log('error')).on('success', log('success'));

  return event;
};

var setLevel = function setLevel(logLevel) {
  DEFAULT_LOGLEVEL = logLevel;
};

var logger = {
  setLevel: setLevel,
  subscribe: subscribe,
  verbose: log('verbose'),
  log: log('log'),
  info: log('info'),
  warn: log('warn'),
  error: log('error'),
  success: log('success')
};

module.exports = {
  logger: logger,
  events: events,
  LOGLEVELS: LOGLEVELS
};