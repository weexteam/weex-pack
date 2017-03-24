var npm = require("npm");


npm.load(function(result){
  npm.commands.info(["weexpack","ios"], true, function(error,result){
     console.log(result)
  })

})