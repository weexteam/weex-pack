/**
 * Created by yangshengtao on 16/11/28.
 */

const path = require('path')
const yeoman = require('yeoman-generator')
const utils = require('../src/utils')
const npm = require('../src/utils/npm');
const mkdirp = require('mkdirp');
module.exports = yeoman.Base.extend({
  constructor: function () {
    yeoman.Base.apply(this, arguments)
  },

  configuring: function () {
  },

  writing: function () {
    // this.fs.copy(this.templatePath('**/*'), this.destinationPath())
    const copyAndReplace = (src, dest, replacements) => {
      let content = this.fs.read(this.templatePath(src));
      Object.keys(replacements).forEach(regex => {
        content = content.replace(new RegExp(regex, 'gm'), replacements[regex])
      });
      this.fs.write(this.destinationPath(dest),content);
    };
    const copy = (file, dist) => {
      this.fs.copy(this.templatePath(file), this.destinationPath(file))
    }
    mkdirp(this.destinationPath('js'));
    mkdirp(this.destinationPath('android'));
    mkdirp(this.destinationPath('ios'));
    mkdirp(this.destinationPath('web'));
    copy('LICENSE');
    copy('RELEASENOTES.md');
    copyAndReplace('README.md','README.md',
      {
        // replace project name
        '\\$\\{pluginName\\}': this.options.pluginName
      }
    );
    copyAndReplace('package.json','js/package.json',
      {
        '\\$\\{pluginName\\}': this.options.pluginName
      }
    );
     copyAndReplace('plugin.xml','plugin.xml',
      {
        // replace project name
        '\\$\\{pluginName\\}': this.options.pluginName,
        '\\$\\{pluginId\\}': this.options.pluginName
      }
    );
   copyAndReplace('package.json','package.json',
      {
        // replace project name
        '\\"name\\"\\:\\s*\\"\\w+\\"': `"name": "${npm.prefix + this.options.pluginName}"`
      }
    )
  },

  install: function () {
  },

  end: function () {
  }

});
