/**
 * Created by godsong on 16/12/7.
 */
const child_process = require('child_process');
const Chalk = require('chalk');
const npm = require('npm');
const path = require('path');
const fs = require('fs');

const tar = require('tar'),
  zlib = require('zlib');



exports.getLastestVersion = function (name, callback) {
  let trynum = 0;
  npm.load(function () {
    var load = function (npmName) {
      npm.commands.info([npmName, 'version'], true, function (error, result) {
        if (error && trynum == 0) {
          trynum++;
          if (npmName == 'weex-gcanvas') {
            var prefix = 'weex-plugin--';
          }
          else {
            var prefix = 'weex-plugin-';
          }
          load(prefix + npmName);
        }
        else if (error && trynum !== 0) {
          throw new Error(error);
        }
        else {
          let version;
          for (const p in result) {
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
    npm.commands.cache(['add', (npmName + '@' + version)], function (error, result) {
      if (error) {
        throw new Error(error);
      }
      else {
        const packageDir = path.resolve(npm.cache, result.name, result.version, 'package');
        const packageTGZ = path.resolve(npm.cache, result.name, result.version, 'package.tgz');
        callback(packageTGZ, packageDir);
      }
    });
  });
};

exports.unpackTgz = function (package_tgz, unpackTarget, callback) {
  const extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 };

  fs.createReadStream(package_tgz)
        .on('error', function (err) {
          console.warn('Unable to open tarball ' + package_tgz + ': ' + err);
        })
        .pipe(zlib.createUnzip())
        .on('error', function (err) {
          console.warn('Error during unzip for ' + package_tgz + ': ' + err);
        })
        .pipe(tar.Extract(extractOpts))
        .on('error', function (err) {
          console.warn('Error during untar for ' + package_tgz + ': ' + err);
        })
        .on('end', function (result) {
          callback(result);
        });
};

exports.prefix = 'weex-plugin--';
