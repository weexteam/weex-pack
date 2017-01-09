const path = require('path')
const yeoman = require('yeoman-generator')
const utils = require('../src/utils')
const chalk = require('chalk');

const dependencies = [
  'weex-html5',
]

const devDependencies = [
  'eslint',
  'eslint-config-weex',
  'serve',
  'webpack',
  'weex-loader',
]

module.exports = yeoman.Base.extend({

  constructor: function () {
    yeoman.Base.apply(this, arguments)
    // compose with Android and iOS generator
    const args = { args: arguments[0], options: this.options }
    this.composeWith('weex:android', args, {
      local: require.resolve(path.resolve(__dirname, 'android'))
    });
    this.composeWith('weex:ios', args, {
      local: require.resolve(path.resolve(__dirname, 'ios'))
    });
    
  },

  configuring: function() {
  },

  writing: function() {
    // this.fs.copy(this.templatePath('**/*'), this.destinationPath())

    const copy = (file, dist) => {
      this.fs.copy(this.templatePath(file), this.destinationPath(file))
    }

    copy('README.md');
    copy('webpack.config.js');
    copy('app.js');
    copy('src/index.vue');
    copy('android.config.json');
    copy('ios.config.json');
    copy('build');
    copy('index.html');
    copy('weex.html');
    utils.copyAndReplace(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        // replace project name
        '\\"name\\"\\:\\s*\\"\\w+\\"' : `"name": "${this.options.projectName}"`,
      }
    );
    console.log(`please run "cd ${this.options.projectName} && npm insatll" . Then you can use:
npm run build  : ` + chalk.grey("build this project") +
`\nnpm run serve : ` + chalk.grey("start a local server"));
  },

  install: function() {
    // this.npmInstall(dependencies, { save: true })
    // this.npmInstall(devDependencies, { saveDev: true })
  },

  end: function() {
  }
})
