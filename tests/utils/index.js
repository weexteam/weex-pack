const chai = require('chai');
const expect = chai.expect;
// const fs = require('fs');
const child_process = require('child_process');
const util = require('../../src/utils/index');

module.exports = function() {
  it('Find XCode project', function() {
    expect(util.findXcodeProject('./weexpackdemo/platform/ios')).to.equal(false);
    expect(typeof util.findXcodeProject('./weexpackdemo/platform/ios') == 'object').to.equal(false);
  });

  // it('exec some comamnd', function() {
  //   util.exec('cd tests').then(function() {
  //     expect(fs.existsSync('flow.test.js')).to.equal(true);
  //   });
  // });
  //
  // it('test iOS devices list', function() {
  //   var deviceInfo = child_process.execSync('xcrun instruments -s devices', {encoding: 'utf8'})
  //   var devicesList = util.parseIOSDevicesList(deviceInfo);
  //   expect(devicesList.length>0).to.equal(true);
  //   expect(typeof devicesList[0] === 'object').to.equal(true);
  // });
  //
  // it('test android devices list', function() {
  //   let devicesInfo = '';
  //   try {
  //     devicesInfo = child_process.execSync(`adb devices`, {encoding: 'utf8'})
  //   } catch (e) {
  //     console.log('adb not work');
  //   }
  //   let devicesList = util.parseDevicesResult(devicesInfo)
  //   expect(Array.isArray(devicesList)).to.equal(true);
  //
  // });
  
  
};
