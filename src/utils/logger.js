const chalk = require('chalk')
const EventEmitter = require('events').EventEmitter;

const events = new EventEmitter();
const LOGLEVELS = ['verbose', 'log', 'info', 'warn', 'error', 'success'];

// global var
const LOGLEVEL = {
  VERBOSE: 'verbose',
  LOG: 'log',
  WARN: 'warn',
  INFO: 'info',
  ERROR: 'error',
  SUCCESS: 'success'
}

const SEVERITY = {
  verbose: 1000,
  log: 2000,
  warn: 3000,
  info: 3000,
  error: 5000,
  success: 10000
}

const LOGCOLOR = {
  verbose: 'white',
  log: 'white',
  warn: 'yellow',
  info: 'white',
  error: 'red',
  success: 'green'
}

let PREFIX = '[weex]'
const SEP = ':'


let DEFAULT_LOGLEVEL = LOGLEVEL.LOG;


const formatError = (error, isVerbose) => {
  let message = '';
  if (error instanceof Error) {
    if (isVerbose) {
      message = error.stack;
    } else {
        message = error.message;
    }
  }
  else {
    // Plain text error message
    message = error;
  }
  if (typeof message === 'string' && message.toUpperCase().indexOf('ERROR:') !== 0) {
    // Needed for backward compatibility with external tools
    message = 'Error: ' + message;
  }
  return message;
}

const log = (loglevel) => {
  return (message) => {
    const isVerbose = DEFAULT_LOGLEVEL === LOGLEVEL.VERBOSE;
    if (!SEVERITY[DEFAULT_LOGLEVEL] || SEVERITY[DEFAULT_LOGLEVEL] > SEVERITY[loglevel]) {
      // return instance to allow to chain calls
      return;
    }
    if (message instanceof Error || isVerbose) {
      message = formatError(message, isVerbose);
    }
    const color = LOGCOLOR[loglevel]
    let time;
    let prefix;
    let sep;
    if (SEVERITY[loglevel] >= SEVERITY[LOGLEVEL.INFO]) {
      time = new Date()
      prefix = chalk.gray(`${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`)
      sep = ':'
      console.log(chalk.grey(prefix), sep, chalk[color](message))
    }
    else {
      console.log(chalk[color](message))
    }
  }
}

const subscribe =  (event) => {
  if (!(event instanceof EventEmitter)){
    throw new Error('Subscribe method only accepts an EventEmitter instance as argument');
  }
  event
    .on('verbose', log('verbose'))
    .on('log', log('log'))
    .on('info', log('info'))
    .on('warn', log('warn'))
    .on('error', log('error'))
    .on('success', log('success'))
  
  return event;
};

const setLevel = (logLevel) => {
  DEFAULT_LOGLEVEL = logLevel;
}

const logger = {
  setLevel,
  subscribe,
  verbose: log('verbose'),
  log: log('log'),
  info: log('info'),
  warn: log('warn'),
  error: log('error'),
  success: log('success')
}

module.exports = {
  logger,
  events,
  LOGLEVELS
}