const Url = require('url');
const Http = require('http');
const chalk = require('chalk');
const crypto = require('crypto');
const Fs = require('fs');
const Path = require('path');
const os = require('os');
const login = require('./login');
const request = require('request');

var _mapper = {};
const TMP_DIR = typeof os.tmpdir === 'function' ? os.tmpdir() : os.tmpDir();
const CACHE_FILE_NAME = 'registry_map.json';
try {
  _mapper = JSON.parse(Fs.readFileSync(Path.join(TMP_DIR, CACHE_FILE_NAME)));
} catch (e) {

}
let marketEnv = 'online';
let marketUrlMap = {
  'online': 'https://market.dotwe.org',
  'pre': 'https://market-pre.dotwe.org',
  'daily': 'https://weex-market.taobao.net'
};
let argv = process.argv.join(' ');
let match = /--market(?:\s+|=)(.+)(\s|$)/.exec(argv);
if (match) {
  marketEnv = match[1];
}
function resolveFullName(name,namespace){
  return namespace?namespace+'-'+name:name
}
exports.domain = marketUrlMap[marketEnv];
exports.publish = function (name, namespace, fullname,ali, version, extend,typeid) {
  extend = extend || {}
  return new Promise(function (resolve, reject) {
    console.log(exports.domain + '/json/sync/sync.json?token=' + login.getToken() + '&name=' + name +  '&fullname=' + fullname + '&p=' + !!ali+(namespace?'&namespace=' + namespace :''+ '&tagId=' + typeid))
    let url = exports.domain + '/json/sync/sync.json?token=' + login.getToken() + '&name=' + name +  '&fullname=' + fullname + '&p=' + !!ali+(namespace?'&namespace=' + namespace :''+ '&tagId=' + typeid);
    if(extend&&extend.weexpack == "0.4.0"){
      url += "&wpv=4"
    }
    //console.log(url)
    post(url, extend).then(function (res) {
      if (res.success) {
        console.log();
        console.log(chalk.yellow('plugin [' + name + '@' + version + '] publish success! sync to market maybe need a few minutes.'));
        console.log(chalk.yellow(`you can visit ${exports.domain} see your plugin. if not exist you can retry ${chalk.blue('weexpack plugin publish')}`))
        console.log();
        resolve()
      }
      else if (res.data.code == 10004) {
        console.error(chalk.red(`Market sync rejected! Namespace unmatched!`));
      }
      else if (res.data.code == 10005) {
        console.error(chalk.red(`Market sync rejected! Token failure!`));
      }
      else if (res.data.code == 10007) {
        console.error(chalk.red(`already synced!`));
      }
      else {
        console.error(chalk.red(`Market sync rejected!`));
      }
    }).catch(function (e) {
      console.error(chalk.red(`Market sync failed! Please retry ${chalk.blue('weexpack plugin publish')}`));
      console.error(chalk.grey('error info:'+e));
    })
  })

};

exports.apply = function (name, p) {
  return new Promise((resolve, reject)=> {
    post(exports.domain + '/json/sync/apply.json?name=' + name + '&p=' + !!p).then(function (res) {
      if (res.success) {
        resolve(res.data);
      }
      else {
        throw new Error('apply plugin fullname error!');
      }

    }).catch(function (e) {
      console.error(chalk.red(`\nMarket apply failed! Please retry ${chalk.blue('weexpack plugin publish')}\n`));
      console.error(chalk.grey('error info:'+e));
    })
  })
};
global.WeexMarket = {};

global.WeexMarket.info = exports.info = function (name) {
  if (_mapper[name]) {
    return Promise.resolve(_mapper[name]);
  }
  else {
    return new Promise((resolve, reject)=> {
      post(exports.domain + '/json/sync/info.json?name=' + name).then(function (res) {
        if (res.success) {
          _mapper[name] = res.data;
          try {
            Fs.writeFileSync(Path.join(TMP_DIR, CACHE_FILE_NAME), JSON.stringify(_mapper, null, 4))
          } catch (e) {
            console.error('registry map save error');
          }
          resolve(res.data)
        }
        else {
          if (res.data && res.data.code === '10001') {
            reject('plugin "' + name + '" not found')
          }
          else {
            reject('market error:' + JSON.stringify(res));
          }
        }

      }, function (e) {
        reject(e.toString());
      })
    })
  }
}
var post = function (url, data) {

  return new Promise(function (resolve, reject) {
    var req = request(url, function (error, response, body) {
      if (response.statusCode == 200) {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      }
      else {
        reject(response.statusCode);
      }
    }).on('error', function (err) {
      var e = new Error('Connect Error for request for ' + url);
      e.name = 'Http Request Error';
      reject(e);
    });


  //   if (data) {
  //     data = new Buffer(JSON.stringify(data));
  //     var headers = {
  //       "Content-Type": 'application/json;charset=UTF-8',
  //       "Content-Length": data.length
  //     }
  //   }
  //   else {
  //     headers = {
  //       "Content-Length": 0
  //     }
  //   }
  // console.log('------')
  // console.log(urlObj.path)

  //   var req = Http.request({
  //     host: urlObj.hostname,
  //     method: 'post',
  //     path: urlObj.path,
  //     port: urlObj.port || 80,
  //     headers: headers
  //   }, function (res) {
    
  //     var body = '';
  //     res.on('data', function (chunk) {
  //       body += chunk.toString();
  //     });
  //     res.on('end', function () {
  //       if (res.statusCode == 200) {
  //         try {
  //           resolve(JSON.parse(body));
  //         } catch (e) {
  //           resolve(body);
  //         }
  //       }
  //       else {
  //         reject(res.statusCode);
  //       }
  //     });
  //   });

    // req.on('error', function (err) {
    //   var e = new Error('Connect Error for request for ' + url);
    //   e.name = 'Http Request Error';
    //   reject(e);
    // });
    // if (data != null)req.write(data);
    // req.end();
  })
};
