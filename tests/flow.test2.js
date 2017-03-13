// test weexpack create command
const create = require('./flow/weexpack-create.flow');
const platformAdd = require('./flow/weexpack-platform.flow');
const buildWeb = require('./flow/weexpack-build-web.flow');
const pluginCreate = require('./flow/weexpack-plugin-create.flow');
const pluginAdd = require('./flow/weexpack-plugin-add.flow');
const weexPluginCreate = require('./flow/weexpack-weexplugin.flow');

describe('test "weexpack" command', function () {
  this.timeout(40000);
  create();
  platformAdd();
  pluginCreate();
  buildWeb();
  pluginAdd();
  weexPluginCreate.createIOS();
  weexPluginCreate.createAndroid();

});