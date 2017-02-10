// test weexpack create command
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const child_process = require('child_process');

describe('test "weexpack create" command', function () {
  child_process.exec('node ./bin/weexpack-create weexpackdemo');
  this.timeout(3000);
  it('test file structure', function () {
    setTimeout(function () {
      expect(fs.existsSync('./weexpackdemo/package.json')).to.equal(true);
      expect(fs.existsSync('./weexpackdemo/src/index.we')).to.equal(true);
      expect(fs.existsSync('./weexpackdemo/plugins')).to.equal(true);
    }, 2500);      
  });
});


