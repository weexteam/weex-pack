const Url = require('url');
const Http = require('http');
const chalk=require('chalk');
exports.publish = function (name, version) {
  return new Promise(function(resolve,reject){
    post('http://10.218.136.234/json/sync/sync.json?name='+name).then(function(data){
      console.log();
      console.log(chalk.yellow('plugin ['+name+'@'+version+'] publish success! sync to market maybe need a few minutes.'));
      console.log(chalk.yellow(`you can visit ${exports.domain} see your plugin. if not exist you can retry ${chalk.blue('weexpack plugin publish')}` ))
      console.log();
      resolve()
    }).catch(function(){
      console.log(chalk.red(`Market sync failed! Please retry ${chalk.blue('weexpack plugin publish')}`));
      reject();
    })
  })

};
exports.domain='http://weex-market.taobao.net/';
var post = function (url, data) {
  return new Promise(function (resolve, reject) {
    var urlObj = Url.parse(url);
    if (data) {
      data = new Buffer(JSON.stringify(data));
      var headers = {
        "Content-Type": 'application/json;charset=UTF-8',
        "Content-Length": data.length
      }
    }
    else {
      headers = {
        "Content-Length": 0
      }
    }

    var req = Http.request({
      host: urlObj.hostname,
      method: 'post',
      path: urlObj.path,
      port: urlObj.port || 80,
      headers: headers
    }, function (res) {
      var body = '';
      res.on('data', function (chunk) {
        body += chunk.toString();
      });
      res.on('end', function () {
        if (res.statusCode == 200) {
          resolve(body);
        }
        else {
          reject(res.statusCode);
        }
      });
    });

    req.on('error', function (err) {
      var e = new Error('Connect Error for request for ' + url);
      e.name = 'Http Request Error';
      reject(e);
    });
    if (data != null)req.write(data);
    req.end();
  })
};
