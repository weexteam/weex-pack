const path = require('path')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments)

    // compose with Android and iOS generator
    const args = { args: arguments[0], options: this.options }
    this.composeWith('weex:android', args, {
      local: require.resolve(path.resolve(__dirname, 'android'))
    })
    this.composeWith('weex:ios', args, {
      local: require.resolve(path.resolve(__dirname, 'ios'))
    })
  },

  configuring: function() {
  },

  writing: function() {
    this.fs.copy(this.templatePath('**/*'), this.destinationPath())

    // const copyTo = (src, dist) => {
    //   if (src && dist) {
    //     this.fs.copy(this.templatePath(src), this.destinationPath(dist))
    //   }
    // }

    // copyTo('_gitignore', '.gitignore')
    // copyTo('android', 'android')
    // copyTo('_buckconfig', '.buckconfig')
  },

  install: function() {
  },

  end: function() {
  }
})
