var npm = require("npm");
var utils = require("../utils");
var npmHelper = require("../utils/npm")
var path = require("path");
var shell = require('shelljs');
var fs = require("fs");
var xcode = require("xcode");
var plist = require("plist");
var gradle = require("./gradle")
var podfile = require("./podfile")
var merge = require("merge")
var cli = require("../cli")


var cordova_lib = require('../../lib'),
    cordova = cordova_lib.cordova;

var cordovaUtils = require('../../lib/src/cordova/util')

const semver = require('semver')

function install(pluginName, args){
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
           if(result.pluginDependencies){
             for(var pn in result.pluginDependencies){
               install(pn, result.pluginDependencies[pn])
             }
           }
         }
         else{
           cli(args)
           //cordova.raw["plugin"]("add", [target]);
        }
      })
    })
  }
  else{
    utils.isNewVersionPlugin(pluginName,version, function(result){
      if(result){
        handleInstall(dir, pluginName, version, result)
        if(result.pluginDependencies){
          for(var pn in result.pluginDependencies){
            install(pn, result.pluginDependencies[pn])
          }
        }
      }
      else{
        cli(args)
        //cordova.raw["plugin"]("add", [target]);
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
    var name = option.ios&&option.ios.name?option.ios.name:pluginName


    if(option.ios&&option.ios.plist){
      var projectPath;
        if(!project.isWorkspace){
          projectPath = path.join(dir,project.name,"project.pbxproj")
        }
        installPList(dir, projectPath, option.ios.plist||{})
    }

    if(option.ios&&option.ios.type=="pod"){

      var iosVersion = option.ios&&option.ios.version || version
      const buildPatch = podfile.makeBuildPatch(name, iosVersion);
      podfile.applyPatch(path.join(dir,"Podfile"), buildPatch);
      console.log(name +" install success in ios project")
    }
    else{
      npmHelper.fetchCache(pluginName, version, function (packageTGZ, packageDir) {
        npmHelper.unpackTgz(packageTGZ, path.join(process.cwd(),"weexplugins",pluginName), function(){
          var targetPath = path.join(process.cwd(), "weexplugins", pluginName);
          const buildPatch = podfile.makeBuildPatch(targetPath, "");
          podfile.applyPatch(path.join(dir,"Podfile"), buildPatch);
          console.log(name +" install success in ios project")
        })
      })
    }


  }
  else if (utils.isAndroidProject(dir)){
    var name = option.android&&option.android.name?option.android.name:pluginName
    if(option.android&&option.android.type == "maven"){
      var androidVersion =  option.android&&option.android.version || version
      const buildPatch = gradle.makeBuildPatch(name, androidVersion, option.android.groupId||"");
      gradle.applyPatch(path.join(dir,"build.gradle"), buildPatch);
      console.log(name +" install success in android project")
    }
    else {
        npmHelper.fetchCache(pluginName, version, function (packageTGZ, packageDir) {
          npmHelper.unpackTgz(packageTGZ, path.join(process.cwd(),"weexplugins",pluginName), function(){
            var targetPath = path.join(process.cwd(), "weexplugins", pluginName);
            //
            const settingPatch = gradle.makeSettingsPatch(pluginName, targetPath)
            gradle.applyPatch(path.join(dir,"settings.gradle"), settingPatch);

            const buildPatch = gradle.makeBuildPatch(name, version, option.android.groupId||"");
            gradle.applyPatch(path.join(dir,"build.gradle"), buildPatch, true);
            console.log(name +" install success in android project")
          })
        })
    }


  }
  //cordova工程
  else if(cordovaUtils.isCordova(dir)){

    var platformList = cordovaUtils.listPlatforms(dir);
    for(var i = 0; i < platformList.length;i++){
      //npm install

      installInPackage(dir, pluginName, version)
      var platformDir = path.join(dir,"platforms", platformList[i].toLowerCase())
      handleInstall(platformDir, pluginName, version, option)
    }

  }
  else if(fs.existsSync(path.join(dir,"package.json"))){
    installInPackage(dir, pluginName, version)
    console.log(name +" install success ")
  }
  else {
    console.log("can't recognize type of this project")
  }

}


function installPList(projectRoot, projectPath, config){
  var xcodeproj = xcode.project(projectPath);
  xcodeproj.parseSync();

  var xcBuildConfiguration = xcodeproj.pbxXCBuildConfigurationSection();

  for(var p in xcBuildConfiguration){
    var entry = xcBuildConfiguration[p];
    if(entry.buildSettings && entry.buildSettings.INFOPLIST_FILE){
      var plist_file_entry = entry
      break;
    }

  }
  if(plist_file_entry){
    var plist_file = path.join(projectRoot, plist_file_entry.buildSettings.INFOPLIST_FILE.replace(/^"(.*)"$/g, '$1').replace(/\\&/g, '&'));

  }


  if (!fs.existsSync(plist_file) ) {
    console.error('Could not find *-Info.plist file');
  }
  else{
    var obj = plist.parse(fs.readFileSync(plist_file, 'utf8'));
    obj = merge.recursive(true, obj, config)

    fs.writeFileSync(plist_file,plist.build(obj))

  }
}



function installInPackage(dir, pluginName, version, option){
  var p = path.join(dir,"package.json")
  if(fs.existsSync(p)){
    var pkg = require(p);
    pkg.dependencies[pluginName] = version;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 4));
  }


}

module.exports = install



