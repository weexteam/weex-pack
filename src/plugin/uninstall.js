var npm = require("npm");
var utils = require("../utils");
var npmHelper = require("../utils/npm")
var path = require("path");
var shell = require('shelljs');
var fs = require("fs");

var gradle = require("./gradle")
var podfile = require("./podfile")
var cordovaUtils = require('../../lib/src/cordova/util')


var cordova_lib = require('../../lib'),
    cordova = cordova_lib.cordova;

function uninstall(pluginName){
  var version;
  var target = pluginName
  if(/@/ig.test(pluginName)){
    var temp = pluginName.split("@")
    pluginName = temp[0];
    version = temp[1]
  }

  var dir = process.cwd();

  //get the lastest version
  if(!version){
    npmHelper.getLastestVersion(pluginName, function(version){

      utils.isNewVersionPlugin(pluginName, version, function(result){

        if(result){
          handleUninstall(dir, pluginName, version,  result)
        }
        else{
          cordova.raw["plugin"]("remove", [target]);
        }
      })
    })
  }
  else{
    utils.isNewVersionPlugin(pluginName,version, function(result){
      if(result){
        handleUninstall(dir, pluginName, version, result)
      }
      else{
        cordova.raw["plugin"]("remove", [target]);
      }
    })
  }

  //判断是否是新版本

}


function handleUninstall(dir, pluginName, version, option){
  //check out the type of current project
  var project
  if(project = utils.isIOSProject(dir)){
    if(!fs.existsSync(path.join(dir,"Podfile"))){
      console.log("can't find Podfile file");
      return ;
    }
    var name = option.ios&&option.ios.name?option.ios.name:pluginName
    const buildPatch = podfile.makeBuildPatch(name, version);
    podfile.revokePatch(path.join(dir,"Podfile"), buildPatch);
    console.log(name +" has removed in ios project")
  }
  else if (utils.isAndroidProject(dir)){

    var name = option.android&&option.android.name?option.android.name:pluginName
    const buildPatch = gradle.makeBuildPatch(name, version);
    gradle.revokePatch(path.join(dir,"build.gradle"), buildPatch);
    console.log(name +" has removed in android")
  }
  //cordova工程
  else if(cordovaUtils.isCordova(dir)) {
    //1111
    var platformList = cordovaUtils.listPlatforms(dir);
    for (var i = 0; i < platformList.length; i++) {
      dir = path.join(dir,"platforms", platformList[i].toLowerCase())
      handleUninstall(dir, pluginName, version, option)
    }
  }
  else {
    console.log("can't recognize type of this project")
  }


}

module.exports = uninstall



