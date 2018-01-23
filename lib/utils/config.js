'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by godsong on 16/10/12.
 */
var path = require('path');
var inquirer = require('inquirer');
var fs = require('fs');
var chalk = require('chalk');
var _ = require('underscore');
var utils = require('./index');
var logger = utils.logger;

var _resolveConfigDef = function _resolveConfigDef(source, configDef, config, key) {
  if (configDef.type) {
    if (config[key] === undefined) {
      throw new Error('Config:[' + key + '] must have a value!');
    }
    return replacer[configDef.type](source, configDef.key, config[key]);
  } else {
    return configDef.handler(source, config[key], replacer);
  }
};

var Platforms = {
  ios: 'ios',
  android: 'android'
};

var replacer = {
  plist: function plist(source, key, value) {
    var r = new RegExp('(<key>' + key + '</key>\\s*<string>)[^<>]*?</string>', 'g');
    if (key === 'WXEntryBundleURL' || key === 'WXSocketConnectionURL') {
      if (key === 'WXEntryBundleURL') {
        value = path.join('bundlejs', value);
      }
      return source.replace(/<\/dict>\n?\W*?<\/plist>\W*?\n?\W*?\n?$/i, function (match) {
        return '  <key>' + key + '</key>\n  <string>' + value + '</string>\n' + match;
      });
    }
    return source.replace(r, '$1' + value + '</string>');
  },
  xmlTag: function xmlTag(source, key, value) {
    var tagName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'string';

    var r = new RegExp('<' + tagName + ' name="' + key + '" .*>[^<]+?</' + tagName + '>', 'g');
    return source.replace(r, '<' + tagName + ' name="' + key + '">' + value + '</' + tagName + '>');
  },
  xmlAttr: function xmlAttr(source, key, value) {
    var tagName = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'string';

    var r = new RegExp('<' + tagName + ' name="' + key + '"\\s* value="[^"]*?"\\s*/>', 'g');
    return source.replace(r, '<' + tagName + ' name="' + key + '" value="' + value + '"/>');
  },
  regexp: function regexp(source, _regexp, value) {
    return source.replace(_regexp, function (m, a, b) {
      return a + value + (b || '');
    });
  }
};

var PlatformConfig = function () {
  function PlatformConfig(properties, rootPath, platform, configs) {
    _classCallCheck(this, PlatformConfig);

    this.rootPath = rootPath;
    this.platform = platform;
    this.configs = configs;
    if (properties instanceof PlatformConfigResolver) {
      var map = {};
      this.properties = [];
      for (var key in properties.def) {
        for (var propName in properties.def[key]) {
          if (!map[propName]) {
            this.properties.push({
              name: propName,
              desc: properties.def[key].desc || 'enter your ' + propName + ':'
            });
            map[propName] = true;
          }
        }
      }
    } else {
      this.properties = properties.split(',').map(function (prop) {
        var splits = prop.split('|');
        return {
          name: splits[0],
          desc: splits[1] || 'enter your ' + splits[0] + ':'
        };
      });
    }
  }

  _createClass(PlatformConfig, [{
    key: 'getConfig',
    value: function getConfig() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var config = {};
        var defaultConfig = {};
        var questions = [];
        var answers = {};
        var configPath = path.join(_this.rootPath, _this.platform + '.config.json');
        var defaultConfigPath = path.join(_this.rootPath, '.wx', 'config.json');
        if (fs.existsSync(defaultConfigPath)) {
          var wxConfig = require(defaultConfigPath);
          defaultConfig = wxConfig && wxConfig[_this.platform] || {};
        }
        if (fs.existsSync(configPath)) {
          config = require(configPath);
        }
        config = _.extend(_this.configs || {}, defaultConfig, config);
        logger.log('============Build Config============');
        _this.properties.forEach(function (prop) {
          if (config[prop.name] !== undefined) {
            answers[prop.name] = config[prop.name];
            logger.log(chalk.green(utils.fill(prop.name, 12) + ' : ' + answers[prop.name]));
          } else {
            questions.push({
              type: 'input',
              message: prop.desc,
              name: prop.name
            });
          }
        });
        if (questions.length > 0) {
          inquirer.prompt(questions).then(function (answers) {
            Object.assign(config, answers);
            fs.writeFileSync(path.join(_this.rootPath, _this.platform + '.config.json'), JSON.stringify(config, null, 4));
            resolve(config);
          });
        } else {
          logger.info('If you want to change build config.please modify ' + _this.platform + '.config.json');
          resolve(config);
        }
      });
    }
  }]);

  return PlatformConfig;
}();

var PlatformConfigResolver = function () {
  function PlatformConfigResolver(def) {
    _classCallCheck(this, PlatformConfigResolver);

    this.def = def;
  }

  _createClass(PlatformConfigResolver, [{
    key: 'resolve',
    value: function resolve(config, basePath) {
      var _this2 = this;

      basePath = basePath || process.cwd();
      for (var d in this.def) {
        if (this.def.hasOwnProperty(d)) {
          (function () {
            var targetPath = path.join(basePath, d);
            var source = fs.readFileSync(targetPath).toString();

            var _loop = function _loop(key) {
              if (_this2.def[d].hasOwnProperty(key)) {
                var configDef = _this2.def[d][key];
                if (_.isArray(configDef)) {
                  configDef.forEach(function (def) {
                    source = _resolveConfigDef(source, def, config, key);
                  });
                } else {
                  source = _resolveConfigDef(source, configDef, config, key);
                }
              }
            };

            for (var key in _this2.def[d]) {
              _loop(key);
            }
            fs.writeFileSync(targetPath, source);
          })();
        }
      }
    }
  }]);

  return PlatformConfigResolver;
}();

var AndroidConfigResolver = new PlatformConfigResolver({
  'build.gradle': {
    AppId: {
      type: 'regexp',
      key: /(applicationId ")[^"]*(")/g
    }
  },
  'app/src/main/res/values/strings.xml': {
    AppName: {
      type: 'xmlTag',
      key: 'app_name'
    },
    SplashText: {
      type: 'xmlTag',
      key: 'dummy_content'
    }
  },
  'app/src/main/res/xml/app_config.xml': {
    WeexBundle: {
      handler: function handler(source, value, replacer) {
        if (/https?/.test(value)) {
          source = replacer.xmlAttr(source, 'launch_locally', 'false', 'preference');
          return replacer.xmlAttr(source, 'launch_url', value, 'preference');
        } else {
          source = replacer.xmlAttr(source, 'launch_locally', 'true', 'preference');
          var name = value.replace(/\.(we|vue)$/, '.js');
          return replacer.xmlAttr(source, 'local_url', 'file://assets/dist/' + name, 'preference');
        }
      }
    }
  }
});

var iOSConfigResolver = new PlatformConfigResolver({
  'WeexDemo/WeexDemo-Info.plist': {
    AppName: {
      type: 'plist',
      key: 'CFBundleDisplayName'
    },
    Version: {
      type: 'plist',
      key: 'CFBundleShortVersionString'
    },
    BuildVersion: {
      type: 'plist',
      key: 'CFBundleVersion'
    },
    AppId: {
      type: 'plist',
      key: 'CFBundleIdentifier'
    },
    WeexBundle: {
      type: 'plist',
      key: 'WXEntryBundleURL'
    },
    Ws: {
      type: 'plist',
      key: 'WXSocketConnectionURL'
    }
  },
  'WeexDemo.xcodeproj/project.pbxproj': {
    CodeSign: [{
      type: 'regexp',
      key: /("?CODE_SIGN_IDENTITY(?:\[sdk=iphoneos\*])?"?\s*=\s*").*?(")/g
    }, {
      type: 'plist',
      key: 'CODE_SIGN_IDENTITY(\\[sdk=iphoneos\\*])?'
    }],
    Profile: [{
      type: 'regexp',
      key: /(PROVISIONING_PROFILE\s*=\s*")[^"]*?(")/g
    }, {
      type: 'plist',
      key: 'PROVISIONING_PROFILE'
    }]
  }

});

module.exports = {
  Platforms: Platforms,
  PlatformConfig: PlatformConfig,
  PlatformConfigResolver: PlatformConfigResolver,
  AndroidConfigResolver: AndroidConfigResolver,
  iOSConfigResolver: iOSConfigResolver
};