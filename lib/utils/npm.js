'use strict';

/**
 * Created by godsong on 16/12/7.
 */
var npm = require('npm');
var path = require('path');
var fs = require('fs');

var tar = require('tar');
var zlib = require('zlib');

exports.getLastestVersion = function (name, callback) {
  var trynum = 0;
  npm.load(function () {
    var load = function load(npmName) {
      npm.commands.info([npmName, 'version'], true, function (error, result) {
        var prefix = void 0;
        if (error && trynum === 0) {
          trynum++;
          if (npmName === 'weex-gcanvas') {
            prefix = 'weex-plugin--';
          } else {
            prefix = 'weex-plugin-';
          }
          load(prefix + npmName);
        } else if (error && trynum !== 0) {
          throw new Error(error);
        } else {
          var version = void 0;
          for (var p in result) {
            version = p;
          }
          callback(version);
        }
      });
    };

    load(name);
  });
};

exports.fetchCache = function (npmName, version, callback) {
  npm.load(function () {
    npm.commands.cache(['add', npmName + '@' + version], function (error, result) {
      if (error) {
        throw new Error(error);
      } else {
        var packageDir = path.resolve(npm.cache, result.name, result.version, 'package');
        var packageTGZ = path.resolve(npm.cache, result.name, result.version, 'package.tgz');
        callback(packageTGZ, packageDir);
      }
    });
  });
};

exports.unpackTgz = function (packageTgz, unpackTarget, callback) {
  var extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 };

  fs.createReadStream(packageTgz).on('error', function (err) {
    console.warn('Unable to open tarball ' + packageTgz + ': ' + err);
  }).pipe(zlib.createUnzip()).on('error', function (err) {
    console.warn('Error during unzip for ' + packageTgz + ': ' + err);
  }).pipe(tar.Extract(extractOpts)).on('error', function (err) {
    console.warn('Error during untar for ' + packageTgz + ': ' + err);
  }).on('end', function (result) {
    callback(result);
  });
};

exports.prefix = 'weex-plugin--';