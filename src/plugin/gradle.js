const fs = require('fs');
const path = require('path');
const isWin = process.platform === 'win32';


function applyPatch(file, patch, isProject) {
  var content = fs.readFileSync(file, 'utf8');

  if(content.match(patch.findPattern || patch.patch)){
    content = content.replace(patch.findPattern || patch.patch, '')
  }

  if(patch.findProjectPattern){
    content = content.replace(patch.findProjectPattern, '')
  }


  if(isProject){
    content = content.replace(patch.pattern, match => `${match}${patch.projectPatch}`)
  }
  else{
    content = content.replace(patch.pattern, match => `${match}${patch.patch}`)
  }

  fs.writeFileSync(file, content)
};

function makeBuildPatch(name,version, groupId, isProject) {
  return {
    pattern: /\t*dependencies {\n/,
    projectPatch:`    compile project(':${name}')\n`,
    patch: `    compile '${groupId}:${name}:${version}'\n`,
    findPattern:new RegExp('\t*compile\\s+\''+groupId+':'+name+'.*\'\\n',"g"),
    findProjectPattern:new RegExp('\t*compile\\s+project\\(\':'+name+'\'\\).*\\n',"g")
  };
};


function makeSettingsPatch(name, projectDir) {

  /*
   * Fix for Windows
   * Backslashes is the escape character and will result in
   * an invalid path in settings.gradle
   * https://github.com/rnpm/rnpm/issues/113
   */
  if (isWin) {
    projectDir = projectDir.replace(/\\/g, '/');
  }

  return {
    pattern: '\n',
    patch: `include ':${name}'\n` +
    `project(':${name}').projectDir = ` +
    `new File('${projectDir}')\n`,
    findPattern:new RegExp("include ':"+name+"'\\nproject\\(':"+name+"'\\).projectDir = new File\\('"+projectDir+"'\\)\\n","g")
  };
};

function revokePatch(file, patch) {

  var content = fs.readFileSync(file, 'utf8');
  var p = content.match(patch.findProjectPattern)

   content = content.replace(patch.findPattern||patch.patch, '').replace(patch.findProjectPattern,'')
  fs.writeFileSync(file,content)

};

module.exports = {
  applyPatch,
  makeBuildPatch,
  revokePatch,
  makeSettingsPatch
}