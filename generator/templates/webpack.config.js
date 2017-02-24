const pathTo = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');

const entry = {};
const bannerExcludeFiles = [];
const webSrcDirectory = 'src';
const vueWebTemp = 'temp';
const hasPluginInstalled = fs.existsSync('./web/plugin.js');

function getEntryFileContent (entryPath, vueFilePath) {
  const relativePath = pathTo.relative(pathTo.join(entryPath, '../'), vueFilePath);
  let contents = '';
  if(hasPluginInstalled) {
    const plugindir = pathTo.resolve("./web/plugin.js");
    contents = 'require(\'' + plugindir + '\') \n';
  }
  contents += 'var App = require(\'' + relativePath + '\')\n';
  contents += 'App.el = \'#root\'\n';
  contents += 'new Vue(App)\n';
  return contents;
}

function walk(dir) {
  dir = dir || '.';
  var directory = pathTo.join(__dirname, 'src', dir);
  var entryDirectory = pathTo.join(dir);
  fs.readdirSync(directory)
    .forEach(function(file) {
      var fullpath = pathTo.join(directory, file);
      var stat = fs.statSync(fullpath);
      var extname = pathTo.extname(fullpath);
      if (stat.isFile() && extname === '.vue') {
        var entryFile = pathTo.join(vueWebTemp, dir, pathTo.basename(file, extname) + '.js');
        fs.outputFileSync(pathTo.join(entryFile), getEntryFileContent(entryFile, fullpath));
        var name = pathTo.join(dir, pathTo.basename(file, extname));
        entry[name] = pathTo.join(__dirname, entryFile) + '?entry=true';
      } else if (stat.isDirectory() && file !== 'build' && file !== 'include') {
        var subdir = pathTo.join(dir, file);
        walk(subdir);
      }
    });
}

walk();

var banner = '// NOTE: for vue2.0 and platform:web only.\n'

var bannerPlugin = new webpack.BannerPlugin(banner, {
  raw: true,
  exclude: bannerExcludeFiles
})

module.exports = {
  entry: entry,
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      }, {
        test: /\.vue(\?[^?]+)?$/,
        loaders: ['vue']
      }
    ]
  },
  plugins: [bannerPlugin]
}
