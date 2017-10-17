const fs = require('fs');
const path = require('path');
if (typeof self !== 'undefined') {
  try {
    fs.symlinkSync(__dirname, path.join(path.dirname(__dirname), self.name));
  }
  catch (e) {
    console.info('symlink name error!');
  }
}
try {
  deps.forEach(function (d) {
    let entry;
    try {
      entry = require.resolve(d.fullname);
    }
    catch (e) {
    }
    if (entry) {
      const basePath = entry.substr(0, entry.indexOf(d.fullname) + d.fullname.length);
      const pkgPath = path.join(basePath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath));
      pkg.name = d.name;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg), null, 4);
      const newPath = basePath.replace(new RegExp(d.fullname + '$'), d.name);
      if (!fs.existsSync(newPath)) {
        fs.symlinkSync(basePath, newPath);
      }
    }
  });
}
catch (e) {
  console.log('namespace fix error');
}
