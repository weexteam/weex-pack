/**
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 'License'); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

var Q = require('q');
var shell = require('shelljs');
var superspawn = require('cordova-common').superspawn;
var events = require('cordova-common').events;
var depls = require('dependency-ls');
var path = require('path');
var fs = require('fs');
var CordovaError = require('cordova-common').CordovaError;
var isUrl = require('is-url');

/* 
 * A function that npm installs a module from npm or a git url
 *
 * @param {String} target   the packageID or git url
 * @param {String} dest     destination of where to install the module
 * @param {Object} opts     [opts={save:true}] options to pass to fetch module
 *
 * @return {String|Promise}    Returns string of the absolute path to the installed module.
 *
 */
module.exports = function(target, dest, opts) {
    var fetchArgs = ['install'];
    opts = opts || {};
    var tree1;

    //check if npm is installed
    return isNpmInstalled()
    .then(function() {
        if(dest && target) {
            //add target to fetchArgs Array
            fetchArgs.push(target);
        
            //append node_modules to dest if it doesn't come included
            if (path.basename(dest) !== 'node_modules') {
            dest = path.resolve(path.join(dest, 'node_modules'));
            }
        
            //create dest if it doesn't exist
            if(!fs.existsSync(dest)) {
                shell.mkdir('-p', dest);         
            } 

        } else return Q.reject(new CordovaError('Need to supply a target and destination'));

        //set the directory where npm install will be run
        opts.cwd = dest;

        //if user added --save flag, pass it to npm install command
        if(opts.save) {
            events.emit('verbose', 'saving');
            fetchArgs.push('--save'); 
        } 
    

        //Grab json object of installed modules before npm install
        return depls(dest);
    })
    .then(function(depTree) {
        tree1 = depTree;

        //install new module
        return superspawn.spawn('npm', fetchArgs, opts);
    })
    .then(function(output) {
        //Grab object of installed modules after npm install
        return depls(dest);
    })
    .then(function(depTree2) {
        var tree2 = depTree2;

        //getJsonDiff will fail if the module already exists in node_modules.
        //Need to use trimID in that case. 
        //This could happen on a platform update.
        var id = getJsonDiff(tree1, tree2) || trimID(target); 

        return getPath(id, dest);
    }) 
    .fail(function(err){
        return Q.reject(new CordovaError(err));
    });
};


/*
 * Takes two JSON objects and returns the key of the new property as a string.
 * If a module already exists in node_modules, the diff will be blank. 
 * cordova-fetch will use trimID in that case.
 *
 * @param {Object} obj1     json object representing installed modules before latest npm install
 * @param {Object} obj2     json object representing installed modules after latest npm install
 *
 * @return {String}         String containing the key value of the difference between the two objects
 *
 */
function getJsonDiff(obj1, obj2) {
    var result = '';

    //regex to filter out peer dependency warnings from result
    var re = /UNMET PEER DEPENDENCY/;

    for (var key in obj2) {
        //if it isn't a unmet peer dependency, continue
        if (key.search(re) === -1) {
            if(obj2[key] != obj1[key]) result = key;
        }
    }
    return result;
}

/*
 * Takes the specified target and returns the moduleID
 * If the git repoName is different than moduleID, then the 
 * output from this function will be incorrect. This is the 
 * backup way to get ID. getJsonDiff is the preferred way to 
 * get the moduleID of the installed module.
 *
 * @param {String} target    target that was passed into cordova-fetch.
 *                           can be moduleID, moduleID@version or gitURL
 *
 * @return {String} ID       moduleID without version.
 */
function trimID(target) {
    var parts;

    //If GITURL, set target to repo name
    if (isUrl(target)) {
        //strip away .git and everything that follows       
        var strippedTarget = target.split('.git');
        var re = /.*\/(.*)/;
        //Grabs everything in url after last `/`
        parts = strippedTarget[0].match(re);
        
        target = parts[1];
    }
    
    //strip away everything after '@'
    //also support scoped packages
    if(target.indexOf('@') != -1) {
        parts = target.split('@');
        if (parts.length > 1 && parts[0] === '') {
            //scoped package
            target = '@' + parts[1];
        } else {
            target = parts[0];
        }
    }        
    
    return target;
}

/* 
 * Takes the moduleID and destination and returns an absolute path to the module
 *
 * @param {String} id       the packageID
 * @param {String} dest     destination of where to fetch the modules
 *
 * @return {String|Error}  Returns the absolute url for the module or throws a error
 *
 */

function getPath(id, dest) {
    var finalDest = path.resolve(path.join(dest, id));
    
    //Sanity check it exists
    if(fs.existsSync(finalDest)){
        return finalDest;
    } else return Q.reject(new CordovaError('Failed to get absolute path to installed module'));
}

/*
 * Checks to see if npm is installed on the users system
 * @return {Promise|Error} Returns true or a cordova error.
 */

function isNpmInstalled() {
    if(!shell.which('npm')) {
        return Q.reject(new CordovaError('"npm" command line tool is not installed: make sure it is accessible on your PATH.'));
    }
    return Q();
}

/* 
 * A function that deletes the target from node_modules and runs npm uninstall 
 *
 * @param {String} target   the packageID
 * @param {String} dest     destination of where to uninstall the module from
 * @param {Object} opts     [opts={save:true}] options to pass to npm uninstall
 *
 * @return {Promise|Error}    Returns a promise with the npm uninstall output or an error.
 *
 */
module.exports.uninstall = function(target, dest, opts) {
    var fetchArgs = ['uninstall'];
    opts = opts || {};

    //check if npm is installed on the system
    return isNpmInstalled()
    .then(function() {    
        if(dest && target) {
            //add target to fetchArgs Array
            fetchArgs.push(target);  
        } else return Q.reject(new CordovaError('Need to supply a target and destination'));

        //set the directory where npm uninstall will be run
        opts.cwd = dest;

        //if user added --save flag, pass it to npm uninstall command
        if(opts.save) {
            fetchArgs.push('--save'); 
        }

        //run npm uninstall, this will remove dependency
        //from package.json if --save was used.
        return superspawn.spawn('npm', fetchArgs, opts);
    })
    .then(function(res) {
        var pluginDest = path.join(dest, 'node_modules', target);
        if(fs.existsSync(pluginDest)) {
            shell.rm('-rf', pluginDest);
        } 
        return res;
    })
    .fail(function(err) {
        return Q.reject(new CordovaError(err));
    });
};
