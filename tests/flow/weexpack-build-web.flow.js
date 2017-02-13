// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const child_process = require('child_process');

module.exports = function () {
  it('test weexpack build web command', function (done) {
    setTimeout(function () {
      expect(fs.existsSync('./weexpackdemo/dist/index.js')).to.equal(true);
      done();
    }, 10000);      
  });
  it('test weexpack build ios command', function (done) {
    setTimeout(function () {
      expect(fs.existsSync('./weexpackdemo/dist/index.js')).to.equal(true);
      done();
    }, 10000);      
  });
  it('test weexpack build android command', function (done) {
    setTimeout(function () {
      expect(fs.existsSync('./weexpackdemo/dist/index.js')).to.equal(true);
      done();
    }, 10000);      
  });
}


