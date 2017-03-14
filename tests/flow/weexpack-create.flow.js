// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');

module.exports = function () {
  it('test weexpack create command', function (done) {
    const pkg = fs.existsSync(path.join(__dirname, '../../weexpackdemo/package.json'));
    const srcwe = fs.existsSync(path.join(__dirname, '../../weexpackdemo/src/index.we'));
    const plugin = fs.existsSync(path.join(__dirname, '../../weexpackdemo/plugins'));
    expect(pkg && srcwe && plugin).to.equal(true);
    done();
  });
}
