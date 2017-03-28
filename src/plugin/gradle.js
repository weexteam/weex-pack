const fs = require('fs');

function applyPatch(file, patch) {
  var content = fs.readFileSync(file, 'utf8');

  if(content.match(patch.findPattern)){
    content = content.replace(patch.findPattern, '')
  }
  content = content.replace(patch.pattern, match => `${match}${patch.patch}`)
  fs.writeFileSync(file, content)
};

function makeBuildPatch(name,version) {
  return {
    pattern: /\t*dependencies {\n/,
    patch: `    compile '${name}:${version}'\n`,
    findPattern:new RegExp('    compile\\s+\''+name+'.*\'\\n',"g")
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