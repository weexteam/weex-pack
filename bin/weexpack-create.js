#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const create = require('../src/create/create')

program
  .usage('[options] [project-name]')
  .option('-c, --config [path]', 'specify the configuration file')
  .on('--help', () => {
  console.log('  Examples:')
console.log()
console.log(chalk.grey('    # create a standard weex plugin template'))
console.log('    $ ' + chalk.blue('weexpack create plugin'))
console.log()
})
.parse(process.argv)

// check if plugin name exist
if (program.args.length < 1) {
  program.help()
  process.exit()
}

function createPlugin() {
  const pluginName = program.args[0];

  // make sure project name is a valid
  if (pluginName.match(/^[$A-Z_][0-9A-Z_-]*$/i)) {
    create(pluginName, program.config)
  } else {
    console.log()
    console.log(`  ${chalk.red('Invalid plugin name:')} ${chalk.yellow(pluginName)}`)
    process.exit()
  }
}

createPlugin();
