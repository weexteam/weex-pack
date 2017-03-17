var fs = require('fs');
var path = require('path');
if (typeof self !== 'undefined') {
  try {
    fs.symlinkSync(__dirname, path.join(path.dirname(__dirname), self.name))
  } catch (e) {
    console.info('symlink name error!')
  }
}
try {
  deps.forEach(function (d) {
    var entry;
    try {
      entry = require.resolve(d.fullname);
    } catch (e) {
    }
    if (entry) {
      var basePath = entry.substr(0, entry.indexOf(d.fullname) + d.fullname.length);
      var pkgPath = path.join(basePath, 'package.json');
      var pkg = JSON.parse(fs.readFileSync(pkgPath));
      pkg.name = d.name;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg), null, 4);
      var newPath = basePath.replace(new RegExp(d.fullname + '$'), d.name);
      if (!fs.existsSync(newPath)) {
        fs.symlinkSync(basePath, newPath)
      }
    }

  });
} catch (e) {
  console.log('namespace fix error')
}
