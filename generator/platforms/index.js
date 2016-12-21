const path = require('path')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments)
  },

  writing: function() {
    this.fs.copy(this.templatePath('**/*'), this.destinationPath('../platforms'))
  },

  install: function() {
  },

  end: function() {
  }
})
