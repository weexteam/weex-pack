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

var cli = require("../cli")

function uninstall(pluginName, args){
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
          if(result.pluginDependencies){
            for(var pn in result.pluginDependencies){
              uninstall(pn, result.pluginDependencies[pn])
            }
          }
        }
        else{
          cli(args)
          //cordova.raw["plugin"]("remove", [target]);
        }
      })
    })
  }
  else{
    utils.isNewVersionPlugin(pluginName,version, function(result){
      if(result){
        handleUninstall(dir, pluginName, version, result)
        if(result.pluginDependencies){
          if(result.pluginDependencies){
            for(var pn in result.pluginDependencies){
              uninstall(pn, result.pluginDependencies[pn])
            }
          }
        }
      }
      else{
        cli(args)
        //cordova.raw["plugin"]("remove", [target]);
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
    var iosVersion =  option.ios&&option.ios.version || version
    const buildPatch = podfile.makeBuildPatch(name, iosVersion);
    podfile.revokePatch(path.join(dir,"Podfile"), buildPatch);
    console.log(name +" has removed in ios project")
  }
  else if (utils.isAndroidProject(dir)){
    var name = option.android&&option.android.name?option.android.name:pluginName
    var androidVersion =  option.android&&option.android.version || version
    const buildPatch = gradle.makeBuildPatch(name, androidVersion, option.android.groupId ||"");
    gradle.revokePatch(path.join(dir,"build.gradle"), buildPatch);
    console.log(name +" has removed in android")
  }
  //cordova工程
  else if(cordovaUtils.isCordova(dir)) {
    //1111
    var platformList = cordovaUtils.listPlatforms(dir);
    for (var i = 0; i < platformList.length; i++) {
      uninstallInPackage(dir, pluginName, version)
      handleUninstall(path.join(dir,"platforms", platformList[i].toLowerCase()), pluginName, version, option)
    }
  }
  else if(fs.existsSync(path.join(dir,"package.json"))){
    uninstallInPackage(dir, pluginName, version)
  }
  else {
    console.log("can't recognize type of this project")
  }

}

function uninstallInPackage(dir, pluginName, version){
  var p = path.join(dir,"package.json")
  if(fs.existsSync(p)){
    var pkg = require(p);
    if(pkg.dependencies[pluginName]){
      delete  pkg.dependencies[pluginName]
    }
    fs.writeFileSync(p, JSON.stringify(pkg, null, 4));
  }
}


module.exports = uninstall



