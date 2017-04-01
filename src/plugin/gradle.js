const fs = require('fs');
const path = require('path');
const isWin = process.platform === 'win32';


function applyPatch(file, patch) {
  var content = fs.readFileSync(file, 'utf8');

  if(content.match(patch.findPattern)){
    content = content.replace(patch.findPattern, '')
  }
  content = content.replace(patch.pattern, match => `${match}${patch.patch}`)
  fs.writeFileSync(file, content)
};

function makeBuildPatch(name,version, groupId) {
  return {
    pattern: /\t*dependencies {\n/,
    patch: `    compile '${groupId}:${name}:${version}'\n`,
    findPattern:new RegExp('    compile\\s+\''+groupId+':'+name+'.*\'\\n',"g")
  };
};


function makeSettingsPatch(name, androidConfig, projectConfig) {
  var projectDir = path.relative(
      path.dirname(projectConfig.settingsGradlePath),
      androidConfig.sourceDir
  );

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
  };
};

function revokePatch(file, patch) {
  fs.writeFileSync(file, fs
      .readFileSync(file, 'utf8')
      .replace(patch.findPattern, '')
  );
};

module.exports = {
  applyPatch,
  makeBuildPatch,
  revokePatch
}