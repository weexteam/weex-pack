// only build plugin module
require('webpack')
require('weex-loader')

var path = require('path');
var fs=require('fs');

let root = process.cwd();

var entry={};
function walk(dir) {
  var directory = path.join(root, dir)
  fs.readdirSync(directory)
    .forEach(function (file) {
      var fullpath = path.join(directory, file)
      var stat = fs.statSync(fullpath)
      if (stat.isFile() &&
        (path.extname(fullpath) === '.js' || path.extname(fullpath) === '.we' || path.extname(fullpath) === '.vue')) {
        var name = path.join( dir, path.basename(file, '.js'))
        entry[name] = fullpath + '?entry=true'
      }
    })
}
walk('plugins');

module.exports = {
  entry: entry,
  output: {
    path: path.join(root,'plugin'),
    filename: '[name].js'
  },
  devtool:'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js(\?[^?]+)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015',
      },
      {
        test: /\.we(\?[^?]+)?$/,
        loaders: 'weex-loader',
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        loaders: 'vue',
      }
    ]
  },
  
  /*plugins: [
    new webpack.optimize.UglifyJsPlugin( {
      minimize : true,
      sourceMap : true,
      mangle: true,
      compress: {
        warnings: false
      }
    } )
  ]*/
  
}