const Fs = require('fs');
const fs = require('fs-extra');
const chalk = require('chalk');
const request = require('request');
const Market = require('./market');
const Path = require('path');
const HOME = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH
const WEEX_CONFIG_PATH = HOME + '/.weex-market/config.json'

function saveToken(token, email) {
  var _config = {
    "email": email,
    "token": token
  }
  fs.ensureFile(WEEX_CONFIG_PATH, function (err) {
    if (err) {
      return console.error(err);
    }
    fs.outputFile(WEEX_CONFIG_PATH,JSON.stringify(_config),function (err1) {
      if (err1) {
        return console.error(err1);
      }
      console.log("Login Successful！");
    })
  });
}

function delInfo(){
  fs.remove(WEEX_CONFIG_PATH, function (err) {
    if (err) return console.error(err)
    console.log('logout success!')
  })
}

module.exports = {
  login:function (email, pwd) {
    request('https://market.dotwe.org/user/json/token/request.json?email=' + email + '&pwd=' + pwd, function (error, response, body) {
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
  logout :function(){
    delInfo();
    // process.exit(-1)
  },
  getInfo : function(){
    var info = fs.existsSync(WEEX_CONFIG_PATH) ? JSON.parse(fs.readFileSync(WEEX_CONFIG_PATH, {encoding:'utf8'})) : null;
    if (info === null) {
      console.log(chalk.red('Login failed, please login again！'))
      console.log(chalk.red('You need to authorize this machine using `weexpack plugin login`'))
      process.exit(-1)
    } else {
      return info
    }
  },
  getToken : function(){
    var info = fs.existsSync(WEEX_CONFIG_PATH) ? JSON.parse(fs.readFileSync(WEEX_CONFIG_PATH, {encoding:'utf8'})) : null;
    if (info === null) {
      console.log(chalk.red('Login failed, please login again！'))
      console.log(chalk.red('You need to authorize this machine using `weexpack plugin login`'))
      process.exit(-1)
    } else {
      return info.token
    }
  },
  sync : function(ali){
    var dir = process.cwd();
    var xmlFilePath = Path.join(dir, 'plugin.xml');
    if (!Fs.existsSync(xmlFilePath)) {
      //新版本
      var pkg = require(Path.join(dir,"./package.json"))
      pkg.weexpack = "0.4.0"
      if (ali) {
        pkg.publishConfig = {
          registry: 'http://registry.npm.alibaba-inc.com'
        }
      }
      Market.publish(pkg.name, '', pkg.name, ali, pkg.version, pkg);
      return;
    }
  }
}
