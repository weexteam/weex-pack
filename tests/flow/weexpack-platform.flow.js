// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');

module.exports = function () {
  /* android time waiting so long 
  it('test weexpack platform add android command', function (done) {
    setTimeout(function () {
      expect(fs.existsSync('./weexpackdemo/platforms/android')).to.equal(true);
      done();
    }, 20000);      
  }); */
  it('test weexpack platform add ios command', function (done) {
    setTimeout(function () {
      expect(fs.existsSync(path.join(__dirname, '../../weexpackdemo/platforms/ios'))).to.equal(true);
      done();
    }, 49000);      
  });
  
}


