const path = require('path')
const chalk = require('chalk')
const yeoman = require('yeoman-environment')

/**
 * Initialize a standard weex project
 * @param {String} project name
 * @param {String} config file path
 */
function init(projectName, configFile) {
  console.log(` => ${chalk.blue('Initialize a new Weex app')} (${chalk.cyan(projectName)})`)
  const env = yeoman.createEnv()

  env.register(
    require.resolve(path.join(__dirname, '../../generator')),
    'weex:app'
  )

  const generator = env.create('weex:app', {args: []})
  generator.destinationRoot(projectName)
  generator.run()
}

module.exports = init
