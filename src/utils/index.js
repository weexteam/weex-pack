const fs = require('fs')
const path = require('path')
const output = require('./output')
const validator = require('./validator')
const child_process = require('child_process')
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

  /**
   * Find xcode project in particular directory
   * @param {String} directory
   * @return {Object} project info
   */
  findXcodeProject(dir) {
    const files = fs.readdirSync(dir)
    const sortedFiles = files.sort()
    for (let i = sortedFiles.length - 1; i >= 0; i--) {
      const fileName = files[i]
      const ext = path.extname(fileName)

      if (ext === '.xcworkspace') {
        return {
          name: fileName,
          isWorkspace: true,
        }
      }
      if (ext === '.xcodeproj') {
        return {
          name: fileName,
          isWorkspace: false,
        }
      }
    }

    return null
  },

  parseIOSDevicesList(text) {
    const devices = []
    const REG_DEVICE = /(.*?) \((.*?)\) \[(.*?)]/

    const lines = text.split('\n')
    for (const line of lines) {
      if (line.indexOf('Watch') >= 0 || line.indexOf('TV') >= 0 || line.indexOf('iPad') >= 0) {
        continue
      }
      const device = line.match(REG_DEVICE)
      if (device !== null) {
        const name = device[1]
        const version = device[2]
        const udid = device[3]
        const isSimulator = line.indexOf('Simulator') >= 0||udid.indexOf('-')>=0
        devices.push({name, version, udid, isSimulator})
      }
    }

    return devices
  },
  parseDevicesResult(result) {
    if (!result) {
      return [];
    }

    const devices = [];
    const lines = result.trim().split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      let words = lines[i].split(/[ ,\t]+/).filter((w) => w !== '');

      if (words[1] === 'device') {
        devices.push(words[0]);
      }
    }
    return devices;
  },
  exec(command){
    return new Promise((resolve, reject)=> {
      try {
        let child = child_process.exec(command, {encoding: 'utf8'}, function () {
          resolve();
        })
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
      }catch(e){
        reject(e);
      }
    })

  },
  buildJS(){
    return this.exec('npm install').then(()=> {
      return this.exec('npm run build')
    })
  },
  getIOSProjectInfo(){
    let projectInfoText=child_process.execSync('xcodebuild  -list', {encoding: 'utf8'});
    let splits=projectInfoText.split(/Targets:|Build Configurations:|Schemes:/);
    let projectInfo={};
    projectInfo.name=splits[0].match(/Information about project "([^"]+?)"/)[1];
    projectInfo.targets=splits[1]?splits[1].split('\n').filter(e=>!!e.trim()).map(e=>e.trim()):[];
    projectInfo.configurations=splits[2]?splits[2].split('\n').filter((e,i)=>!!e.trim()&&i<3).map(e=>e.trim()):[];
    projectInfo.schemes=splits[3]?splits[3].split('\n').filter(e=>!!e.trim()).map(e=>e.trim()):[];
    return {project:projectInfo}
  }
}

module.exports = Object.assign(utils, output, validator)
