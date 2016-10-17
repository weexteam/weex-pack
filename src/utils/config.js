/**
 * Created by godsong on 16/10/12.
 */
const Fs = require('fs');
const Path = require('path');
const Inquirer = require('inquirer');
class Config {
  constructor(properties, path) {
    this.path = path;
    this.properties = properties.split(',').map(prop=> {
      var splits = prop.split('|');
      return {
        name: splits[0],
        desc: splits[1] || 'enter your ' + splits[0] + ':'
      }
    });
  }

  getConfig() {
    return new Promise((resolve, reject)=> {
      let config = {};
      try {
        config = require(this.path);
      }
      catch (e) {
      }
      var questions = [], answers = {};
      console.log('============build config============')
      this.properties.forEach(function (prop) {
        if (config[prop.name] !== undefined) {
          answers[prop.name] = config[prop.name];
          console.log(prop.name + '=>' + answers[prop.name]);
        }
        else {
          questions.push({
            type: 'input',
            message: prop.desc,
            name: prop.name
          })
        }
      });
      if (questions.length > 0) {
        Inquirer.prompt(questions)
          .then((answers) => {
            Object.assign(config, answers);
            Fs.writeFileSync(this.path, JSON.stringify(config, null, 4))
            resolve(config);
          })
      }
      else {
        console.log('if you want to change build config.please modify '+Path.basename(this.path));
        resolve(config)
      }
    })

  }
}
module.exports=Config;
