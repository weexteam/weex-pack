const Fs = require('fs');
const fs = require('fs-extra');
const chalk = require('chalk');
const request = require('request');
const Market = require('./market');
const Path = require('path');
const HOME = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
const WEEX_CONFIG_PATH = HOME + '/.weex-market/config.json'
const host = 'https://market.dotwe.org/user';


let marketEnv = 'online';
let marketUrlMap = {
  'online': 'https://market.dotwe.org',
  'pre': 'https://market-pre.dotwe.org',
  'daily': 'https://weex-market.taobao.net'
};

function saveToken(token, email) {
  var _config = {
    "email": email,
    "token": token
  }
  fs.ensureFile(WEEX_CONFIG_PATH, function (err) {
    if (err) {
      return console.error(err);
    }
    fs.outputFile(WEEX_CONFIG_PATH, JSON.stringify(_config), function (err1) {
      if (err1) {
        return console.error(err1);
      }
      console.log("Login Successful！");
    })
  });
}

function delInfo() {
  fs.remove(WEEX_CONFIG_PATH, function (err) {
    if (err) return console.error(err)
    console.log('logout success!')
  })
}

function getPackageName(name){
  var dir = process.cwd();
  var xmlFilePath = Path.join(dir, 'plugin.xml');
  var _packageName = name;
  if (typeof name != 'string' ){
    if (!Fs.existsSync(xmlFilePath)) {
      var pkg = require(Path.join(dir, "./package.json"))
      _packageName = pkg.name
    }
  }
  return _packageName;
}


exports.domain = marketUrlMap[marketEnv];

module.exports = {
  login: function (email, pwd) {
    const loginReqUrl = [
      host,
      '/json/token/request.json?email=',
      encodeURIComponent(email),
      '&pwd=',
      encodeURIComponent(pwd)
    ].join('');
    
    request(loginReqUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var d = JSON.parse(body)
        if (d.success) {
          saveToken(d.data, email)
        } else {
          console.log(chalk.red('Login failed, please try again！'))
        }
      }
    })
  },
  logout: function () {
    delInfo();
    // process.exit(-1)
  },
  getInfo: function () {
    var info = fs.existsSync(WEEX_CONFIG_PATH) ? JSON.parse(fs.readFileSync(WEEX_CONFIG_PATH, {
      encoding: 'utf8'
    })) : null;
    if (info === null) {
      console.log(chalk.red('Login failed, please login again！'))
      console.log(chalk.red('You need to authorize this machine using `weexpack plugin login`'))
      process.exit(-1)
    } else {
      return info
    }
  },
  getToken: function () {
    var info = fs.existsSync(WEEX_CONFIG_PATH) ? JSON.parse(fs.readFileSync(WEEX_CONFIG_PATH, {
      encoding: 'utf8'
    })) : null;
    if (info === null) {
      console.log(chalk.red('Login failed, please login again！'))
      console.log(chalk.red('You need to authorize this machine using `weexpack plugin login`'))
      process.exit(-1)
    } else {
      return info.token
    }
  },
  sync: function (ali, typeid, market) {
    var dir = process.cwd();
    var xmlFilePath = Path.join(dir, 'plugin.xml');
    if (!Fs.existsSync(xmlFilePath)) {
      //新版本
      var pkg = require(Path.join(dir, "./package.json"))
      pkg.weexpack = "0.4.0"
      if (ali) {
        pkg.publishConfig = {
          registry: 'http://registry.npm.alibaba-inc.com'
        }
      }
      Market.publish(pkg.name, '', pkg.name, ali, pkg.version, pkg, typeid);
      return;
    }
  },
  addGroupMember: function (email,name){
    //console.log(exports.domain + '/json/packageGroup/AddGroupMember.json?memberEmail=' + email + '&packageName=' + getPackageName(name) + '&token=' + this.getToken())
    request(exports.domain + '/json/packageGroup/AddGroupMember.json?memberEmail=' + email + '&packageName=' + getPackageName(name) + '&token=' + this.getToken(), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var d = JSON.parse(body)
        if (d.success) {
          console.log('add member '+ email + ' success !');
        } else {
          console.log(chalk.red('Add group member failed, please try again！'))
        }
      }else{
        console.log(chalk.red('Add group member failed, please try again！'))
      }
    })

  },
  delGroupMember: function (email,name) {
    request(exports.domain + '/json/packageGroup/DelGroupMember.json?memberEmail=' + email + '&packageName=' + getPackageName(name) + '&token=' + this.getToken(), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var d = JSON.parse(body)
        if (d.success) {
          console.log('delete member '+ email + ' success !');
        } else {
          console.log(chalk.red('Delete group member failed, please try again！'))
        }
      }else {
        console.log(chalk.red('Delete group member failed, please try again！'))
      }
    })
  },
  listGroupMember: function (name) {
    //console.log(exports.domain + '/json/packageGroup/ListGroupMember.json?packageName=' + _packageName + '&token=' + this.getToken());
    request(exports.domain + '/json/packageGroup/ListGroupMember.json?packageName=' + getPackageName(name) +'&token=' + this.getToken(), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var d = JSON.parse(body)
        if (d.success) {
          if(d.data.length>0){
            d.data.forEach(function(el) {
              console.log(chalk.blue('useremail:') + el.useremail);
            }, this);
          }else{
            console.log(chalk.red('No Member!'));
          }
        } else {
          console.log(chalk.red('Login failed, please try again！'))
        }
      }
    })
  },
  mySync: function () {
    request(exports.domain + '/json/sync/mySync.json?token=' + this.getToken(), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        var d = JSON.parse(body)
        if (d.success) {
          d.data.forEach(function(el) {
            console.log(chalk.blue('id:') + el.id + chalk.blue('  name:') + el.fullname + chalk.blue('  owner:') + el.owner);
          }, this);
        } else {
          console.log(chalk.red('Get my sync list failed, please try again！'))
        }
      }
    })
  }
}
