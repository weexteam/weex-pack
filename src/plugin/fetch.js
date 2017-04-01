
var npm = require('npm'),
    path = require('path'),
    Q = require('q'),
    unpack = require('./unpack');

var events = require('weexpack-common').events,
    fs     = require('fs'),
    Q      = require('q'),
    tar    = require('tar'),
    zlib   = require('zlib');


var utils = require('../utils/npm')



var HOME = process.env[(process.platform.slice(0, 3) == 'win') ? 'USERPROFILE' : 'HOME'];
var  global_config_path = path.join(HOME, '.weexpack');
var lib_path = path.join(global_config_path, 'lib');


function fetchPackage(packageName, packageVersion, callback) {

          return cachePackage(packageName, packageVersion, callback);

}


/**
 * Invokes "npm cache add," and then returns a promise that resolves to a directory containing the downloaded,
 * or cached package.
 * @param packageName - name of an npm package
 * @param packageVersion - requested version (not a version range)
 */
function cachePackage(packageName, packageVersion, callback) {

  utils.fetchCache(packageName, packageVersion, callback)

}





// Returns a promise for the path to the unpacked tarball (unzip + untar).
function unpackTgz(package_tgz, unpackTarget) {
  return Q.promise(function(resolve, reject) {
    var extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 };

    fs.createReadStream(package_tgz)
        .on('error', function (err) {
          events.emit('warn', 'Unable to open tarball ' + package_tgz + ': ' + err);
          reject(err);
        })
        .pipe(zlib.createUnzip())
        .on('error', function (err) {
          events.emit('warn', 'Error during unzip for ' + package_tgz + ': ' + err);
          reject(err);
        })
        .pipe(tar.Extract(extractOpts))
        .on('error', function(err) {
          events.emit('warn', 'Error during untar for ' + package_tgz + ': ' + err);
          reject(err);
        })
        .on('end', resolve);
  })
      .then(function() {
        return unpackTarget;
      });
}
