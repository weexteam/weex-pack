require('webpack')
require('weex-loader')

var path = require('path')
var fs=require('fs')

var entry={};
function walk(dir, root) {
  var directory = path.join(__dirname, root, dir)
  fs.readdirSync(directory)
    .forEach(function (file) {
      var fullpath = path.join(directory, file)
      var stat = fs.statSync(fullpath)
      if (stat.isFile() &&
        path.extname(fullpath) === '.js') {
        var name = path.join( dir, path.basename(file, '.js'))
        entry[name] = fullpath + '?entry=true'
      }
    })
}
walk('../', 'plugins');
module.exports = {
  entry: entry,
  output: {
    path: '../web',
    filename: '[name].js'
  },
  devtool:'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js(\?[^?]+)?$/,
        loaders: ['weex-loader']
      }
    ]
  }
}