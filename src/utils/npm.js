/**
 * Created by godsong on 16/12/7.
 */
const npm = require('npm');
const path = require('path');
const fs = require('fs');

const tar = require('tar');
const zlib = require('zlib');

exports.getLastestVersion = function (name, callback) {
  let trynum = 0;
  npm.load(function () {
    const load = function (npmName) {
      npm.commands.info([npmName, 'version'], true, function (error, result) {
        let prefix;
        if (error && trynum === 0) {
          trynum++;
          if (npmName === 'weex-gcanvas') {
            prefix = 'weex-plugin--';
          }
          else {
            prefix = 'weex-plugin-';
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

exports.unpackTgz = function (packageTgz, unpackTarget, callback) {
  const extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 };

  fs.createReadStream(packageTgz)
        .on('error', function (err) {
          console.warn('Unable to open tarball ' + packageTgz + ': ' + err);
        })
        .pipe(zlib.createUnzip())
        .on('error', function (err) {
          console.warn('Error during unzip for ' + packageTgz + ': ' + err);
        })
        .pipe(tar.Extract(extractOpts))
        .on('error', function (err) {
          console.warn('Error during untar for ' + packageTgz + ': ' + err);
        })
        .on('end', function (result) {
          callback(result);
        });
};

exports.prefix = 'weex-plugin--';
