const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const child_process = require('child_process');

function createIOS() {
  it('test weexpack weexplugin create ios command', function (done) {
    child_process.exec('rm -rf Weexplugin &&  node ./bin/weexpack-weexplugin create  ios');
    setTimeout(function () {
      const hasDir = fs.existsSync('./Weexplugin');
      const isIos = fs.existsSync('./Weexplugin/Weexplugin.podspec');

      const fileCheck = (hasDir && isIos);
      expect(fileCheck).to.equal(true);
      done();
    }, 2500);
  });
}

function createAndroid() {
  it('test weexpack weexplugin create andorid command', function (done) {
    child_process.exec('rm -rf Weexplugin &&  node ./bin/weexpack-weexplugin create  android');
    setTimeout(function () {
      const hasDir = fs.existsSync('./Weexplugin');
      const isAndroid = fs.existsSync('./Weexplugin/build.gradle');

      const fileCheck = (hasDir && isAndroid);
      expect(fileCheck).to.equal(true);
      done();
    }, 2500);
  });
}

module.exports = {
  createIOS:createIOS,
  createAndroid:createAndroid
}
