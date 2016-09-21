const fs = require('fs')
const path = require('path')
const yeoman = require('yeoman-generator')

module.exports = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments)
  },

  output: function () {
    console.log(' => run yeoman generator')
  }
})
