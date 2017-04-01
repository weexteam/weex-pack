var npm = require("npm");


var utils = require("./utils/npm");
var path = require("path");

utils.fetchCache("weexpack","0.3.12", function(packageTGZ, packageDir){
  console.log(packageTGZ, packageDir)
  utils.unpackTgz(packageTGZ, path.join(process.cwd(),""), function (result) {
      console.log(result)
  })
})