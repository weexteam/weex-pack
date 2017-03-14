// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

module.exports = function () {
  it('test weexpack create command', function (done) {
    child_process.exec('rm -rf weexpackdemo &&  node ./bin/weexpack-create weexpackdemo');
    setTimeout(function () {
      console.log(path.join(__dirname, '../../weexpackdemo/package.json'));
      const pkg = fs.existsSync(path.join(__dirname, '../../weexpackdemo/package.json'));
      const srcwe = fs.existsSync(path.join(__dirname, '../../weexpackdemo/src/index.we'));
      const plugin = fs.existsSync(path.join(__dirname, '../../weexpackdemo/plugins'));
      expect(pkg && srcwe && plugin).to.equal(true);
      child_process.exec('cd weexpackdemo && node ../bin/weexpack-build web');
      // child_process.exec('node ../bin/weexpack-platform add ios');
      child_process.exec('cd weexpackdemo && node ../bin/weexpack-platform add ios');
      child_process.exec('cd weexpackdemo && node ../bin/weexpack-plugin add weex-action-sheet');
      done();
    }, 10000);
  });
}
