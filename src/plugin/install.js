var npm = require("npm");
var utils = require("../utils");
var npmHelper = require("../utils/npm")
var path = require("path");
var shell = require('shelljs');
var fs = require("fs");

var gradle = require("./gradle")
var podfile = require("./podfile")

var cordova_lib = require('../../lib'),
    cordova = cordova_lib.cordova;

var cordovaUtils = require('../../lib/src/cordova/util')

function install(pluginName){
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
           handleInstall(dir, pluginName, version,  result)
         }
         else{
           cordova.raw["plugin"]("add", [target]);
        }
      })
    })
  }
  else{
    utils.isNewVersionPlugin(pluginName,version, function(result){
      if(result){
        handleInstall(dir, pluginName, version, result)
      }
      else{
        cordova.raw["plugin"]("add", [target]);
      }
    })
  }

  //判断是否是新版本

}


function handleInstall(dir, pluginName, version, option){
  //check out the type of current project
  var project
  if(project = utils.isIOSProject(dir)){
    if(!fs.existsSync(path.join(dir,"Podfile"))){
      console.log("can't find Podfile file");
      return ;
    }
    if(option.ios&&option.ios.type=="pod"){
      var name = option.ios&&option.ios.name?option.ios.name:pluginName
      const buildPatch = podfile.makeBuildPatch(name, version);
      podfile.applyPatch(path.join(dir,"Podfile"), buildPatch);
      console.log(name +" install success in ios project")
    }
    else{
      npmHelper.fetchCache(pluginName, version, function (packageTGZ, packageDir) {
        npmHelper.unpackTgz(packageTGZ, path.join(process.cwd(),"weexplugins", function(){
          var targetPath = path.join(process.cwd(), "weexplugins", pluginName);

          const buildPatch = podfile.makeBuildPatch(targetPath, "");
          podfile.applyPatch(path.join(dir,"Podfile"), buildPatch);
          console.log(name +" install success in ios project")
        }))
      })
    }


  }
  else if (utils.isAndroidProject(dir)){

    if(option.android&&option.android.type == "maven"){
      var name = option.android&&option.android.name?option.android.name:pluginName
      const buildPatch = gradle.makeBuildPatch(name, version, option.android.groupId);
      gradle.applyPatch(path.join(dir,"build.gradle"), buildPatch);
      console.log(name +" install success in android project")
    }
    else {

        npmHelper.fetchCache(pluginName, version, function (packageTGZ, packageDir) {
          npmHelper.unpackTgz(packageTGZ, path.join(process.cwd(),"weexplugins", function(){
            var targetPath = path.join(process.cwd(), "weexplugins", pluginName);

            const buildPatch = gradle.makeBuildPatch(name, version, option.android.groupId);
            gradle.applyPatch(path.join(dir,"build.gradle"), buildPatch);
            console.log(name +" install success in android project")
          }))
        })

    }


  }
  //cordova工程
  else if(cordovaUtils.isCordova(dir)){

    var platformList = cordovaUtils.listPlatforms(dir);
    for(var i = 0; i < platformList.length;i++){
      dir = path.join(dir,"platforms", platformList[i].toLowerCase())
      handleInstall(dir, pluginName, version, option)
    }

  }
  else {
    console.log("can't recognize type of this project")
  }

}

module.exports = install



