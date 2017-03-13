// test some file in /src/utils

const utilTest = require('./utils/index');
const utilNpm = require('./utils/npm');

describe('test utils js files', function () {
  this.timeout(20000);
  utilTest();
  // utilNpm();
  
});

