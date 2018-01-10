/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/
/* jshint node:true, bitwise:true, undef:true, trailing:true, quotmark:true,
          indent:4, unused:vars, latedef:nofunc,
          laxcomma:true
*/
let path = require('path'),
  fs = require('fs'),
  help = require('./help'),
  nopt,
  _,
  pkg = require('../package.json'),
  telemetry = require('./telemetry'),
  Q = require('q');
const weexPackCommon = require('weexpack-common');
const WeexpackError = weexPackCommon.CordovaError;
const events = weexPackCommon.events;
const logger = weexPackCommon.CordovaLogger.get();

const weexpackCreate = require('./create')
const cordova_lib = require('./lib');
const cordova = cordova_lib.cordova;
/*
 * init
 *
 * initializes nopt and underscore
 * nopt and underscore are require()d in try-catch below to print a nice error
 * message if one of them is not installed.
 */
function init() {
  try {
    nopt = require('nopt');
    _ = require('underscore');
  }
  catch (e) {
    console.error('Please run npm install from this directory:\n\t' + path.dirname(__dirname));
    process.exit(2);
  }
}
// let shouldCollectTelemetry = false;
module.exports = function (inputArgs, cb) {
  /**
   * mainly used for testing.
   */
  cb = cb || function () {};
  init();
  // If no inputArgs given, use process.argv.
  inputArgs = inputArgs || process.argv;
  let cmd = inputArgs[2]; // e.g: inputArgs= 'node weexpack-create create test'
  const subcommand = getSubCommand(inputArgs, cmd);
  // const isTelemetryCmd = (false && cmd === 'telemetry');
  // ToDO: Move nopt-based parsing of args up here
  if (cmd === '--version' || cmd === '-v') {
    cmd = 'version';
  }
  else if (!cmd || cmd === '--help' || cmd === 'h') {
    cmd = 'help';
  }
  Q().then(function (collectTelemetry) {
    shouldCollectTelemetry = collectTelemetry;
    // if (isTelemetryCmd) {
    //   return Q();
    // }
    return cli(inputArgs);
  }).then(function () {
    // if (shouldCollectTelemetry && !isTelemetryCmd) {
    //   telemetry.track(cmd, subcommand, 'successful');
    // }
    // call cb with error as arg if something failed
    cb(null);
  }).fail(function (err) {
    // if (shouldCollectTelemetry && !isTelemetryCmd) {
    //   telemetry.track(cmd, subcommand, 'unsuccessful');
    // }
    // call cb with error as arg if something failed
    cb(err);
    throw err;
  }).done();
};

const getSubCommand = (args, cmd) => {
  const subCommands = ['platform', 'platforms', 'plugin', 'plugins'
    // 'telemetry'
  ];
  if (subCommands.indexOf(cmd)) {
    return args[3];
  }
  return null;
}

const handleTelemetryCmd = (subcommand, isOptedIn) => {
  if (subcommand !== 'on' && subcommand !== 'off') {
    logger.subscribe(events);
    return help(['telemetry']);
  }
  const turnOn = subcommand === 'on';
  let cmdSuccess = true;
  // turn telemetry on or off
  try {
    if (turnOn) {
      // telemetry.turnOn();
      console.log('Thanks for opting into telemetry to help us improve weexpack.');
    }
    else {
      // telemetry.turnOff();
      console.log('You have been opted out of telemetry. To change this, run: weexpack telemetry on.');
    }
  }
  catch (ex) {
    cmdSuccess = false;
  }
  // track or not track ?, that is the question
  if (!turnOn) {
    // Always track telemetry opt-outs (whether user opted out or not!)
    // telemetry.track('telemetry', 'off', 'via-cordova-telemetry-cmd', cmdSuccess ? 'successful' : 'unsuccessful');
    return Q();
  }
  if (isOptedIn) {
    // telemetry.track('telemetry', 'on', 'via-cordova-telemetry-cmd', cmdSuccess ? 'successful' : 'unsuccessful');
  }
  return Q();
}
const createWeexProject = (dir, appid, appname,cfg, events) => {
  return weexpackCreate(dir // dir to create the project in
    , appid // App id
    , appname // App name
    , cfg || {}, events || undefined);
}

const cli = (inputArgs) => {
  // When changing command line arguments, update doc/help.txt accordingly.
  const knownOpts = {
    'verbose': Boolean,
    'version': Boolean,
    'help': Boolean,
    'silent': Boolean,
    'experimental': Boolean,
    'noregistry': Boolean,
    'nohooks': Array,
    'shrinkwrap': Boolean,
    'copy-from': String,
    'link-to': path,
    'searchpath': String,
    'variable': Array,
    'link': Boolean,
    'force': Boolean,
    // Flags to be passed to `cordova build/run/emulate`
    'debug': Boolean,
    'release': Boolean,
    'market': String,
    'archs': String,
    'device': Boolean,
    'emulator': Boolean,
    'target': String,
    'browserify': Boolean,
    'noprepare': Boolean,
    'fetch': Boolean,
    'nobuild': Boolean,
    'list': Boolean,
    'buildConfig': String,
    'template': String,
    'ali': Boolean
  };
  const shortHands = {
    'd': '--verbose',
    'v': '--version',
    'h': '--help',
    'src': '--copy-from',
    't': '--template',
    'a': '--ali'
  };
  // checkForUpdates();
  const args = nopt(knownOpts, shortHands, inputArgs);
  // For WeexpackError print only the message without stack trace unless we
  // are in a verbose mode.

  logger.subscribe(events);
  if (args.silent) {
    logger.setLevel('error');
  }
  if (args.verbose) {
    logger.setLevel('verbose');
  }

  process.on('uncaughtException', function (err) {
    logger.error(err);
    // Don't send exception details, just send that it happened
    // if (shouldCollectTelemetry) {
    //   telemetry.track('uncaughtException');
    // }
    process.exit(1);
  });

  // const cliVersion = require('../package').version;
  // // TODO: Use semver.prerelease when it gets released
  // const usingPrerelease = /-nightly|-dev$/.exec(cliVersion);
  // if (args.version || usingPrerelease) {
  //   const libVersion = require('cordova-lib/package').version;
  //   let toPrint = cliVersion;
  //   if (cliVersion !== libVersion || usingPrerelease) {
  //     toPrint += ' (cordova-lib@' + libVersion + ')';
  //   }
  //   if (args.version) {
  //     logger.results(toPrint);
  //     return Q();
  //   }
  //   else {
  //     // Show a warning and continue
  //     logger.warn('Warning: using prerelease version ' + toPrint);
  //   }
  // }
  if (/^v0.\d+[.\d+]*/.exec(process.version)) { // matches v0.*
    msg = 'Warning: using node version ' + process.version + ' which has been deprecated. Please upgrade to the latest node version available (v6.x is recommended).';
    logger.warn(msg);
  }
  // If there were arguments protected from nopt with a double dash, keep
  // them in unparsedArgs. For example:
  // cordova build ios -- --verbose --whatever
  // In this case "--verbose" is not parsed by nopt and args.vergbose will be
  // false, the unparsed args after -- are kept in unparsedArgs and can be
  // passed downstream to some scripts invoked by Cordova.
  let unparsedArgs = [];
  const parseStopperIdx = args.argv.original.indexOf('--');
  if (parseStopperIdx !== -1) {
    unparsedArgs = args.argv.original.slice(parseStopperIdx + 1);
  }
  // args.argv.remain contains both the undashed args (like platform names)
  // and whatever unparsed args that were protected by " -- ".
  // "undashed" stores only the undashed args without those after " -- " .
  const remain = args.argv.remain;
  const undashed = remain.slice(0, remain.length - unparsedArgs.length);
  const cmd = undashed[0];
  let subcommand;
  const known_platforms = ['ios', 'android', 'web'];
  let msg;
  if (!cmd || cmd === 'help' || args.help) {
    if (!args.help && remain[0] === 'help') {
      remain.shift();
    }
    return help(remain);
  }
  if (!cordova.hasOwnProperty(cmd)) {
    msg = 'weex doesn\'t know command: ' + cmd + '; try ` weex --help` for a list of all the available commands.';
    throw new WeexpackError(msg);
  }
  const opts = {
    platforms: [],
    options: [],
    verbose: args.verbose || false,
    silent: args.silent || false,
    browserify: args.browserify || false,
    fetch: args.fetch || false,
    // fetch: true,
    nohooks: args.nohooks || [],
    searchpath: args.searchpath,
    ali: args.ali
  };
  if (cmd === 'create') {
    return createWeexProject(undashed[1], undashed[2], undashed[3]);
  }
  else if (cmd === 'platform' || cmd === 'plugin'){
    // platform/plugins add/rm [target(s)]
    subcommand = undashed[1]; // sub-command like "add", "ls", "rm" etc.
    const targets = undashed.slice(2); // array of targets, either platforms or plugins
    const cli_vars = {};
    if (args.variable) {
      args.variable.forEach(function (s) {
        // CB-9171
        const eq = s.indexOf('=');
        if (eq === -1) {
          throw new WeexpackError('invalid variable format: ' + s);
        }
        const key = s.substr(0, eq).toUpperCase();
        const val = s.substr(eq + 1, s.length);
        cli_vars[key] = val;
      });
    }
    const downloadOpts = {
      searchpath: args.searchpath,
      noregistry: args.noregistry,
      nohooks: args.nohooks,
      cli_variables: cli_vars,
      browserify: args.browserify || false,
      fetch: args.fetch || false,
      link: args.link || false,
      save: args.save || false,
      shrinkwrap: args.shrinkwrap || false,
      force: args.force || false,
      ali: args.ali || false
    };
    return cordova.raw[cmd](subcommand, targets, downloadOpts);
  }
}
