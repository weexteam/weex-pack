/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var path = require('path');
var shell = require('shelljs');
var Q = require('q');
var npmHelper = require('../util/npm-helper');
var util = require('./util');
var git = require('../gitclone');

/*
Fetches the latests version of a package from NPM. A promise is returned that
resolves to the directory the NPM package is located in. Package options must be
passed containing a packageName, name, and version.

options - Package options
 */
function npmFetch(packageName, packageVersion) {
    return npmHelper.fetchPackage(packageName, packageVersion);
}

/*
Performs a Git clone an a Git URL, and branch. If the clone was successful,
the path to the cloned directory will be returned. Otherwise, a error is
returned. A gitURL, must be passed, and a branch to checkout at is optionally
passed.

gitURL - URL to Git repository
branch - Branch to checkout at
 */
function gitClone(gitURL, branch) {
    var cloneCallback;          // Resultant callback
    var tmpSubDir;              // Temporary sub-directory
    var tmpDir;                 // Temporary directory
    var checkoutBranch;         // Branch to checkout

    checkoutBranch = branch || 'master';
    tmpSubDir = 'tmp_cordova_git_' + process.pid + '_' + (new Date()).valueOf();
    tmpDir = path.join(util.libDirectory, 'tmp', tmpSubDir);

    shell.rm('-rf', tmpDir);
    shell.mkdir('-p', tmpDir);

    cloneCallback = git.clone(gitURL, checkoutBranch, tmpDir);

    // Callback for Git clone
    cloneCallback.then(
        function() {
            return tmpDir;
        },
        function (err) {
            shell.rm('-rf', tmpDir);

            return Q.reject(err);
        }
    );

    return cloneCallback;
}

exports.gitClone = gitClone;
exports.npmFetch = npmFetch;
