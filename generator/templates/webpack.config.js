require('webpack')
require('weex-loader')

var path = require('path')

module.exports = {
  entry: {
    index: path.join(__dirname, 'src', 'index.we?entry=true')
  },
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.we(\?[^?]+)?$/,
        loaders: ['weex-loader']
      }
    ]
  }
}
