/**
 * Created by yangshengtao on 16/11/28.
 */

const path = require('path')
const yeoman = require('yeoman-generator')
const utils = require('../src/utils')

module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments)
  },

  configuring: function() {
  },

  writing: function() {
    // this.fs.copy(this.templatePath('**/*'), this.destinationPath())

    const copy = (file, dist) => {
      this.fs.copy(this.templatePath(file), this.destinationPath(file))
    }

    copy('doc/')
    copy('LICENSE')
    copy('plugin.xml')
    copy('README.md')
    copy('RELEASENOTES.md')
    copy('src/')
    copy('www/')

    utils.copyAndReplace(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        // replace project name
        '\\"name\\"\\:\\s*\\"\\w+\\"' : `"name": "${this.options.pluginName}"`,
      }
    )
  },

  install: function() {
  },

  end: function() {
  }

})
