/**
 * Created by godsong on 16/12/7.
 */
const child_process = require('child_process');
const ProgressBar = require('./ProgressBar');
const Chalk = require('chalk');
const npm = require("npm");
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
  var load = function(npmName){
    npm.load(function() {
      npm.commands.info([npmName, "version"], true, function (error, result) {
        if (error&&trynum==0) {
          trynum++
          load(exports.prefix+npmName, callback)
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
    })
  }

  load(name);

}






exports.prefix = 'weex-plugin--';
