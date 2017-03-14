// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');

module.exports = function () {
  it('test weexpack build web command', function (done) {
    setTimeout(function () {
      console.log(fs.existsSync(path.join(__dirname, '../../weexpackdemo/dist/index.js')));
      expect(fs.existsSync(path.join(__dirname, '../../weexpackdemo/dist/index.js'))).to.equal(true);
      done();
    }, 50000);      
  });
}


