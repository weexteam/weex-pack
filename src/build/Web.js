/** build the web apps
 * this is a command for weexpack building
 **/
const utils = require('../utils');

const buildWeb = () => buildSinglePlugin();

// build single plugin use webpack
const buildSinglePlugin = () => {
  try {
    utils.buildJS('build:plugin').then(() => {
      utils.exec('npm run pack:web', true);
    });
  }
  catch (e) {
    console.error(e);
  }
};
module.exports = buildWeb;
