const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const child_process = require('child_process')

/**
 * Start web service
 * @param {Object} options
 */
function runWeb(options) {
  if (!checkWebEnv(process.cwd())) {
    console.log()
    console.log(chalk.red('  Not available web environment !'))
    console.log()
    console.log(`  You should run ${chalk.blue('weexpack init')} first`)
    return
  }

  console.log()
  console.log(` => ${chalk.blue.bold('Starting web service')}`)

  install()
  startServer()
}

/**
 * Check web environment
 * @param {Strng} cwd
 */
function checkWebEnv(cwd) {
  return fs.existsSync(path.join(cwd, 'package.json'))
      && fs.existsSync(path.join(cwd, 'web'))
}

/**
 * Install npm dependencies
 */
function install() {
  console.log(`    installing npm packages ...`)

  const deps = [
    'weex-html5',
  ]
  const devDeps = [
    'babel-core',
    'babel-loader',
    'eslint',
    'serve',
    'webpack',
    'weex-loader',
  ]

  const config = {
    stdio: [process.stdin, process.stdout, process.stderr]
  }
  child_process.execSync(`cnpm install ${deps.join(' ')} --save`, config)
  child_process.execSync(`cnpm install ${devDeps.join(' ')} --save-dev`, config)
}

/**
 * Start a web server
 */
function startServer() {
  console.log(`    start server`)

  child_process.execSync('npm run build')
  child_process.execSync('npm run serve &', {
    stdio: [process.stdin, process.stdout, process.stderr]
  })

  console.log()
  console.log(` => ${chalk.green('server is running')}`)
  console.log(`    see ${chalk.cyan('http://localhost:8080/web/index.html')}`)
}

module.exports = runWeb
