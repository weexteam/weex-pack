/**
 * Created by godsong on 16/12/7.
 */
const child_process = require('child_process');
const ReadyStream = require('ready-stream');
const ProgressBar = require('./ProgressBar');

exports.publish=function publish(tnpm,verbose,dir) {
  let pb = new ProgressBar(3000, 'publish', 'uploading...');
  let cmd=tnpm?'tnpm':'npm';
  return new Promise(function (resolve, reject) {
    let npm = child_process.exec(cmd+' publish', {cwd: dir || process.cwd()}, function (error, stdout, stderr) {
      pb.complete(function(){
        if (error) {
          console.log();
          let err=verbose?stderr.toString():stderr.toString().split('\n')[0].replace(/npm ERR! /ig, '');
          console.log(err);
          console.log();
          return;
        }
        console.log(stdout.toString());
        resolve();
      })


    });
  });


  //stream.end();
}
exports.prefix='weex-plugin--';
//publish(true);
