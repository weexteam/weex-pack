var config            = require('../../lib/src/cordova/config'),
    cordova           = require('../../lib/src/cordova/cordova'),
    prepare           = require('../../lib/src/cordova//prepare'),
    cordova_util      = require('../../lib/src/cordova/util'),
    ConfigParser      = require('weexpack-common').ConfigParser,
    fs                = require('fs'),
    os                = require('os'),
    path              = require('path'),
    events            = require('weexpack-common').events,
    lazy_load         = require('../../lib/src/cordova/lazy_load'),
    CordovaError      = require('weexpack-common').CordovaError,
    Q                 = require('q'),
    promiseutil       = require('../../lib/src/util/promise-util'),
    HooksRunner       = require('../../lib/src/hooks/HooksRunner'),
    superspawn        = require('weexpack-common').superspawn,
    semver            = require('semver'),
    shell             = require('shelljs'),
    _                 = require('underscore'),
    PlatformJson      = require('weexpack-common').PlatformJson,
    fetch             = require('cordova-fetch'),
    gitclone      = require('../../lib/src/gitclone'),
    npmUninstall         = require('cordova-fetch').uninstall;


var project = {}

project.createProject = function(projectRoot, platform, opts) {
  var msg;



  opts = opts || {};


  // The "platforms" dir is safe to delete, it's almost equivalent to
  // cordova platform rm <list of all platforms>
  var platformsDir = projectRoot


  return Q().then(function() {
    return downloadProject(projectRoot, platform,  opts);
  }).then(function(dir) {

    var platformPath = path.join(projectRoot, 'Weexplugin');
    var platformAlreadyAdded = fs.existsSync(platformPath);

    if (platformAlreadyAdded) {
      throw new CordovaError('plugin project ' + platform + ' already added.');
      console.log('plugin project ' + platform + ' already added.')
    }

    var tempDir =""
    if(platform == "ios"){
      tempDir = path.join(dir,"bin","templates")
    }
    else {
      tempDir = dir;
    }

    shell.mkdir('-p', platformPath);
    copyProject(tempDir, platformPath)
    if(platform == "ios" && opts.ali == true){
      changeSource(platformPath)
    }

    events.emit('log', ' ');
    events.emit('log', 'add plugin'  + platform + ' project ...');
    console.log('create weexplugin project  success...')


  });

}


function changeSource (destinationDir){

    var weexPluginRootDir = path.join(destinationDir);
    var xcodeProjDir;
    var xcodeCordovaProj;

    try {
      xcodeProjDir = fs.readdirSync(weexPluginRootDir).filter( function(e) { return e.match(/\.xcodeproj$/i); })[0];
      if (!xcodeProjDir) {
        throw new CordovaError('The provided path "' + weexPluginRootDir + '" is not a Weex iOS project.');
      }

      var cordovaProjName = xcodeProjDir.substring(xcodeProjDir.lastIndexOf(path.sep)+1, xcodeProjDir.indexOf('.xcodeproj'));
      xcodeCordovaProj = path.join(weexPluginRootDir, cordovaProjName);
    } catch(e) {
      throw new CordovaError('The provided path "'+weexPluginRootDir+'" is not a weexpack iOS project.');
    }
    var Podfile = require('../../lib/src/platforms/ios_pack/lib/Podfile').Podfile;
    var project_name = xcodeCordovaProj.split('/').pop();
    var podfileFile = new Podfile(path.join(weexPluginRootDir, Podfile.FILENAME), project_name)
    podfileFile.writeUseAliSource()


}




function  removeProject() {


}


function createProjectInWeexpack() {

}


function listPlatforms(project_dir) {
  var core_platforms = require('../../lib/src/platforms/platforms');
  var platforms_dir = path.join(project_dir, 'platforms');
  if ( !exports.existsSync(platforms_dir)) {
    return [];
  }
  var subdirs = fs.readdirSync(platforms_dir);
  return subdirs.filter(function(p) {
    return Object.keys(core_platforms).indexOf(p) > -1;
  });
}

var  pluginProjectApi = {}

pluginProjectApi.create = function (destinationDir, projectConfig, options) {


  var templatePath = destinationDir
  return Q().then(function(){
    copyProject(templatePath, destinationDir)

    return pluginProjectApi;
  })

};

/**
 * Updates already installed platform.
 *
 * @param  {String}  destinationDir  A directory, where existing platform
 *   installed, that should be updated.
 * @param  {Object}  [options]  An options object. The most common options are:
 * @param  {String}  [options.customTemplate]  A path to custom template, that
 *   should override the default one from platform.
 * @param  {Boolean}  [options.link=false]  Flag that indicates that platform's sources
 *   will be linked to installed platform instead of copying.
 *
 * @return {Promise<PlatformApi>} Promise either fulfilled with PlatformApi
 *   instance or rejected with CordovaError.
 */
pluginProjectApi.update = function (destinationDir, options) {
  if (!options || !options.platformDetails)
    return Q.reject(new CordovaError('Failed to find platform\'s \'create\' script. ' +
        'Either \'options\' parameter or \'platformDetails\' option is missing'));

  var command = path.join(options.platformDetails.libDir, 'bin', 'update');
  return superspawn.spawn(command, [destinationDir],
      { printCommand: true, stdio: 'inherit', chmod: true })
      .then(function () {
        var platformApi = knownPlatforms
            .getPlatformApi(options.platformDetails.platform, destinationDir);
        copyCordovaSrc(options.platformDetails.libDir, platformApi.getPlatformInfo());
        return platformApi;
      });
};




function downloadProject(projectRoot, platform) {
  return Q().then(function() {
    var git_url = 'https://github.com/weexteam/weexpluginContainer-iOS.git'
    if (platform == "ios") {
      git_url = 'https://github.com/weexteam/weexpluginContainer-iOS.git'
    }


    if(platform == "android") {
      git_url = 'https://github.com/weexteam/weexplugin-android.git'
    }


    return git_clone(git_url, undefined).fail(function(err) {
      // If it looks like a url, but cannot be cloned, try handling it differently.
      // it's because it's a tarball of the form:
      //     - wp8@https://git-wip-us.apache.org/repos/asf?p=cordova-wp8.git;a=snapshot;h=3.7.0;sf=tgz
      //     - https://api.github.com/repos/msopenTech/cordova-browser/tarball/my-branch
      events.emit('verbose', err.message);
      events.emit('verbose', 'Cloning failed. Let\'s try handling it as a tarball');
    });


    return cordova_npm(projectRoot, target, opts);
  }).fail(function (error) {
    var message = 'Failed to fetch plugin container for platform ' + platform +
        '\nProbably this is either a connection problem, or platform spec is incorrect.' +
        '\nCheck your connection and platform name/version/URL.' +
        '\n' + error;
    return Q.reject(new CordovaError(message));
  });
}

// Returns a promise
function git_clone(git_url, branch) {
  // Create a tmp dir. Using /tmp is a problem because it's often on a different partition and sehll.mv()
  // fails in this case with "EXDEV, cross-device link not permitted".
  var tmp_subidr = 'tmp_cordova_git_' + process.pid + '_' + (new Date()).valueOf();
  var tmp_dir = path.join(cordova_util.libDirectory, 'tmp', tmp_subidr);
  shell.rm('-rf', tmp_dir);
  shell.mkdir('-p', tmp_dir);

  return Q().then(function () {
    var branchToCheckout = branch || 'master';
    return gitclone.clone(git_url, branchToCheckout, tmp_dir);
  }).then(function () {

    return tmp_dir;
  }).fail(function (err) {
    shell.rm('-rf', tmp_dir);
    return Q.reject(err);
  });
}



function cordova_git(platform) {
  var mixed_platforms = _.extend({}, platforms),
      plat;
  if (!(platform.name in platforms)) {
    return Q.reject(new Error('weexpack library "' + platform.name + '" not recognized.'));
  }
  plat = mixed_platforms[platform.name];
  plat.id = 'cordova';

  // We can't use a version range when getting from git, so if we have a range, find the latest release on npm that matches.
  return util.getLatestMatchingNpmVersion(platform.packageName, platform.version).then(function (version) {
    plat.version = version;
    if (/^...*:/.test(plat.url)) {
      plat.url = plat.url + ';a=snapshot;h=' + version + ';sf=tgz';
    }
    return module.exports.custom(mixed_platforms, platform.name);
  });
}

function cordova_npm(platform) {
  if (!(platform.name in platforms)) {
    return Q.reject(new Error('weexpack library "' + platform.name + '" not recognized.'));
  }
  // Check if this version was already downloaded from git, if yes, use that copy.
  // TODO: remove this once we fully switch to npm workflow.
  var platdir = platforms[platform.name].altplatform || platform.name;
  // If platform.version specifies a *range*, we need to determine what version we'll actually get from npm (the
  // latest version that matches the range) to know what local directory to look for.
  return util.getLatestMatchingNpmVersion(platform.packageName, platform.version).then(function (version) {
    var git_dload_dir = path.join(util.libDirectory, platdir, 'cordova', version);
    if (fs.existsSync(git_dload_dir)) {
      var subdir = platforms[platform.name].subdirectory;
      if (subdir) {
        git_dload_dir = path.join(git_dload_dir, subdir);
      }
      events.emit('verbose', 'Platform files for "' + platform.name + '" previously downloaded not from npm. Using that copy.');
      return Q(git_dload_dir);
    }

    // Note that because the version of npm we use internally doesn't support caret versions, in order to allow them
    // from the command line and in config.xml, we use the actual version returned by getLatestMatchingNpmVersion().
    return npmhelper.cachePackage(platform.packageName, version);
  });
}




function copyProject(templateDir, projectDir){
  var templateFiles;      // Current file
  templateFiles = fs.readdirSync(templateDir);
  // Remove directories, and files that are unwanted

  // Copy each template file after filter
  for (var i = 0; i < templateFiles.length; i++) {
    var p = path.resolve(templateDir, templateFiles[i]);
    shell.cp('-R', p, projectDir);
  }
}


module.exports = project
