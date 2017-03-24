var npm = require("npm");



function install(pluginName, version){

  //get the lastest version
  if(!version){
    getLastestVersion(pluginName, function(version){
      isNewVersionPlugin(pluginName,version, function(result){
         if(result){

         }
         else{

        }
      })
    })
  }
  else{
    isNewVersionPlugin(pluginName,version, function(result){
      if(result){

      }
      else{

      }
    })
  }

  //判断是否是新版本

}

function getLastestVersion(pluginName, callback){
  npm.load(function(){
    npm.commands.info(["weexpack","version"], true, function(error,result){
      var version
      for(var  p in result ){
        version = p;
      }
    })
    callback(version)

  })
}

function isNewVersionPlugin(pluginName, version, callback) {
  npm.load(function(){
    npm.commands.info(["weexpack@"+version,"weexpack"], true, function(error,result){
      var weexpack;
      for(var  p in result ){
        weexpack = p;
      }
      if(weexpack&&weexpack == "0.2.0"){
        callback(true)
      }
      else{
        callback(false)
      }
    })
  })
}




