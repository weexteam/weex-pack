const pathTo = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');

const entry = {};
const weexEntry = {};
const vueWebTemp = 'temp';
const hasPluginInstalled = fs.existsSync('./web/plugin.js');

const plugins = [
  new webpack.optimize.UglifyJsPlugin({
    minimize: true
  })
];

function getEntryFileContent(entryPath, vueFilePath) {
  const relativePath = pathTo.relative(pathTo.join(entryPath, '../'), vueFilePath);
  let contents = '';
  if (hasPluginInstalled) {
    const plugindir = pathTo.resolve('./web/plugin.js');
    contents = 'require(\'' + plugindir + '\') \n';
  }
  contents += 'var App = require(\'' + relativePath + '\')\n';
  contents += 'App.el = \'#root\'\n';
  contents += 'new Vue(App)\n';
  return contents;
}

function walk(dir) {
  dir = dir || '.';
  const directory = pathTo.join(__dirname, 'src', dir);
  fs.readdirSync(directory)
    .forEach((file) => {
      const fullpath = pathTo.join(directory, file);
      const stat = fs.statSync(fullpath);
      const extname = pathTo.extname(fullpath);
      if (stat.isFile() && extname === '.vue') {
        const entryFile = pathTo.join(vueWebTemp, dir, pathTo.basename(file, extname) + '.js');
        fs.outputFileSync(pathTo.join(entryFile), getEntryFileContent(entryFile, fullpath));
        const name = pathTo.join(dir, pathTo.basename(file, extname));
        weexEntry[name] = fullpath + '?entry=true';
        entry[name] = pathTo.join(__dirname, entryFile) + '?entry=true';
      } else if (stat.isDirectory() && file !== 'build' && file !== 'include') {
        const subdir = pathTo.join(dir, file);
        walk(subdir);
      }
    });
}

walk();
// webpack 2.0
const webConfig = {
  context: pathTo.join(__dirname, ''),
  entry: entry,
  output: {
    path: pathTo.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader'
        }],
        exclude: /node_modules/
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        use: [{
          loader: 'vue-loader'
        }]
      }
    ]
  },
  plugins: plugins
};
const weexConfig = {
  entry: weexEntry,
  output: {
    path: 'dist',
    filename: '[name].weex.js',
    
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
        }],
        exclude: /node_modules/
      },
      {
        test: /\.vue(\?[^?]+)?$/,
        use: [{
          loader: 'weex-loader'
        }]
      }
    ]
  },
  plugins: plugins
};

module.exports = [webConfig, weexConfig];
