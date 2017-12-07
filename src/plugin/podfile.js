const fs = require('fs');

function applyPatch (file, patch) {
  let content = fs.readFileSync(file, 'utf8');

  if (content.match(patch.findPattern)) {
    content = content.replace(patch.findPattern, '');
  }

  content = content.replace(patch.pattern, match => `${patch.patch}${match}`);
  fs.writeFileSync(file, content);
}

function makeBuildPatch (name, version) {
  let patch = '';
  if (version) {
    patch = `\tpod '${name}', '${version}'\n`;
  }
  else {
    patch = `\tpod '${name}'\n`;
  }

  return {
    pattern: /\t*pod\s+\'\w+\'\s*,?.*\n/,
    patch: patch,
    findPattern: new RegExp('\\t*pod\\s+\'' + name + '\'\\s*,?.*\\n', 'g')
  };
}

function revokePatch (file, patch) {
  fs.writeFileSync(file, fs
      .readFileSync(file, 'utf8')
      .replace(patch.findPattern, '')
  );
}

//

module.exports = {
  applyPatch,
  makeBuildPatch,
  revokePatch
};
