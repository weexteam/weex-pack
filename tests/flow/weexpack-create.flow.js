// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const child_process = require('child_process');
module.exports = function () {
  it('test weexpack create command', function (done) {
    child_process.exec('rm -rf weexpackdemo &&  node ./bin/weexpack-create weexpackdemo');
    setTimeout(function () {
      expect(fs.existsSync('./weexpackdemo/package.json')).to.equal(true);
      expect(fs.existsSync('./weexpackdemo/src/index.we')).to.equal(true);
      expect(fs.existsSync('./weexpackdemo/plugins')).to.equal(true);
      child_process.exec('cd weexpackdemo && node ../bin/weexpack-build web');
      // child_process.exec('node ../bin/weexpack-platform add ios');
      child_process.exec('cd weexpackdemo && node ../bin/weexpack-platform add android');
      child_process.exec('cd weexpackdemo && node ../bin/weexpack-plugin add weex-plugin-amap');
      done();
    }, 25000);
  });
}
