const sortDependencies = (packageJson) => {
  packageJson.devDependencies = sortObject(packageJson.devDependencies);
  packageJson.dependencies = sortObject(packageJson.dependencies);
  return packageJson;
}

const sortObject = (object) => {
  // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
  const sortedObject = {};
  Object.keys(object)
    .sort()
    .forEach(item => {
      sortedObject[item] = object[item];
    });
  return sortedObject;
}

const output = {
  sortDependencies
}

module.exports = {
  output
};
