const fs = require('fs')
const output = require('./output')
const validator = require('./validator')

const utils = {

  copyAndReplace(src, dest, replacements) {
    if (fs.lstatSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest)
      }
    } else {
      let content = fs.readFileSync(src, 'utf8')
      Object.keys(replacements).forEach(regex => {
        content = content.replace(new RegExp(regex, 'gm'), replacements[regex])
      })
      fs.writeFileSync(dest, content)
    }
  },

}

module.exports = Object.assign(utils, output, validator)
