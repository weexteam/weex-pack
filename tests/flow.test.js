// test weexpack create command
const child_process = require('child_process');

const create = require('./flow/weexpack-create.flow');
const platformAdd = require('./flow/weexpack-platform.flow');
const buildWeb = require('./flow/weexpack-build-web.flow');
const pluginCreate = require('./flow/weexpack-plugin-create.flow');
const pluginAdd = require('./flow/weexpack-plugin-add.flow');

describe('test "weexpack" command', function () {
  this.timeout(600000);
  before(function(done) {
    let comands = 'rm -rf weexpackdemo &&  node ./bin/weexpack-create weexpackdemo';
    comands += ' && cd weexpackdemo && node ../bin/weexpack-platform add ios';
    comands += ' && node ../bin/weexpack-build web';
    console.log(comands);
    child_process.exec(comands, function(err, stdout) {
      console.log(1);
      console.log('stdout:' + stdout);
      if (!err) {
        done();  
      } else {
        done(err);
        console.log(err);
      }
    }); 
    
     
  });
  create();
  platformAdd();
  pluginCreate();
  buildWeb();
 // pluginAdd(); 
});