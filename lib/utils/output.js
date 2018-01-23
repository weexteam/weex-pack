"use strict";

var sortDependencies = function sortDependencies(packageJson) {
  packageJson.devDependencies = sortObject(packageJson.devDependencies);
  packageJson.dependencies = sortObject(packageJson.dependencies);
  return packageJson;
};

var sortObject = function sortObject(object) {
  // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
  var sortedObject = {};
  Object.keys(object).sort().forEach(function (item) {
    sortedObject[item] = object[item];
  });
  return sortedObject;
};

var output = {
  sortDependencies: sortDependencies
};

module.exports = {
  output: output
};