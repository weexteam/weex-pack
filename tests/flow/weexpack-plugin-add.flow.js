const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const pluginName = 'weex-action-sheet';

module.exports = function () {
  it('test weexpack plugin add command', function (done) {
    setTimeout(function () {
      const pluginExist = fs.existsSync('./weexpackdemo/plugins/' + pluginName);
      const iosPluginReady = fs.existsSync('./weexpackdemo/platforms/ios/Weexplugin/Weexplugin/Plugins/' + pluginName);
      // const iosPluginReady = fs.existsSync('./weexpackdemo/platforms/ios/Weexplugin/Weexplugin/Plugins/' + pluginName);
      const fileCheck = pluginExist && iosPluginReady;
      expect(fileCheck).to.equal(true);
      done();
    }, 38000);     
  });
};

