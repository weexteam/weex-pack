/**
 * Created by godsong on 16/12/7.
 */
const child_process = require('child_process');
const ProgressBar = require('./ProgressBar');

exports.publish = function publish(tnpm, verbose, dir) {
  let pb = new ProgressBar(3000, 'publish', 'uploading...');
  let cmd = tnpm ? 'tnpm' : 'npm';
  return new Promise(function (resolve, reject) {
    let npm = child_process.exec(cmd + ' publish', {cwd: dir || process.cwd()}, function (error, stdout, stderr) {
      pb.complete(function () {
        if (error) {
          console.log();
          let match=stderr.toString().match(/\n\n([^\n]+)\n/);
          if(match[1]){
            console.error(chalk.red(match[1].replace(/nnpm ERR!|"/g,'')))
          }
          else{
            console.error(chalk.red(stderr.toString()))
          }
          console.log();
         return  resolve(false);
        }
        resolve(true);
      })
    });
  });
};
exports.prefix = 'weex-plugin--';
