/**
 * Created by godsong on 16/12/7.
 */
const child_process = require('child_process');
const ProgressBar = require('./ProgressBar');
const Chalk = require('chalk');
const npm = require("npm");
const path = require("path");
const fs = require("fs")

const tar    = require('tar'),
    zlib   = require('zlib');

exports.publish = function publish(tnpm, verbose, dir) {
  let pb = new ProgressBar(3000, 'publish', 'uploading...');
  let cmd = tnpm ? 'tnpm' : 'npm';
  return new Promise(function (resolve, reject) {
    let npm = child_process.exec(cmd + ' publish', {cwd: dir || process.cwd()}, function (error, stdout, stderr) {
      pb.complete(function () {
        if (error) {
          console.log();
          let match=stderr.toString().replace(/npm ERR! /g,'').match(/\n\n([\s\w\W]+?)\n\n/);
          if(match&&match[1]){
            console.error(Chalk.red(match[1]))
          }
          else{
            console.error(Chalk.red(stderr.toString()))
          }
          console.log();
         return  resolve(false);
        }
        resolve(true);
      })
    });
  });
};



exports.getLastestVersion =  function (name, callback){
  var trynum = 0
  npm.load(function() {

    var load = function(npmName){
        npm.commands.info([npmName, "version"], true, function (error, result) {
          if (error&&trynum==0) {
            trynum++
            if(npmName == "weex-gcanvas"){
              var  prefix = "weex-plugin--"
            }
            else {
              var  prefix = "weex-plugin-"
            }
            load(prefix+npmName)
          }
          else if(error&&trynum!==0){
            throw  new Error(error)
          }
          else {
            var version;
            for (var p in result) {
              version = p;
            }
            callback(version)
          }

        })


    }


      load(name);



  })
}


exports.fetchCache  = function (npmName, version, callback){

  npm.load(function() {
    npm.commands.cache(['add', (npmName + '@' + version)],  function (error, result) {
      if(error){
        throw  new Error(error)
      }
      else {

        var packageDir = path.resolve(npm.cache, result.name, result.version, 'package');
        var packageTGZ = path.resolve(npm.cache, result.name, result.version, 'package.tgz');
        callback(packageTGZ, packageDir)
      }


    })
  })

}

exports.unpackTgz = function(package_tgz, unpackTarget, callback) {

    var extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 };

    fs.createReadStream(package_tgz)
        .on('error', function (err) {
          console.warn('Unable to open tarball ' + package_tgz + ': ' + err);
        })
        .pipe(zlib.createUnzip())
        .on('error', function (err) {
          console.warn('Error during unzip for ' + package_tgz + ': ' + err);
        })
        .pipe(tar.Extract(extractOpts))
        .on('error', function(err) {
          console.warn('Error during untar for ' + package_tgz + ': ' + err);

        })
        .on('end', function(result){
          callback(result)
        });

}







exports.prefix = 'weex-plugin--';
