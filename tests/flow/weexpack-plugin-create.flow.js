const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

module.exports = function () {
  it('test weexpack plugin create command', function (done) {
    child_process.exec('rm -rf weex-plugin &&  node ./bin/weexpack-plugin create  weex-plugin');
    setTimeout(function () {
      const hasPackage = fs.existsSync(path.join(__dirname, '../../weex-plugin/package.json'));
      const hasConfig = fs.existsSync(path.join(__dirname, '../../weex-plugin/plugin.xml'));
      const hasWeb = fs.existsSync(path.join(__dirname, '../../weex-plugin/web'));
      const hasAndroid = fs.existsSync(path.join(__dirname, '../../weex-plugin/android'));
      const hasIos = fs.existsSync(path.join(__dirname, '../../weex-plugin/ios'));
      const fileCheck = (hasPackage && hasConfig && hasWeb && hasAndroid && hasIos);
      expect(fileCheck).to.equal(true);
      done();
    }, 2500);      
  });
}
