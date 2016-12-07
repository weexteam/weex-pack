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

var fetch = require('../index.js');
var uninstall = require('../index.js').uninstall;
var shell = require('shelljs');
var path = require('path');
var fs = require('fs');
var helpers = require('./helpers.js');

describe('platform fetch/uninstall tests via npm & git', function () {

    var tmpDir = helpers.tmpDir('plat_fetch');
    var opts = {};

    beforeEach(function() {
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fetch and uninstall a cordova platform via npm & git', function(done) {
        
        fetch('cordova-android', tmpDir, opts)
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-android');
            
            return uninstall('cordova-android', tmpDir, opts);
        })
        .then(function() {
            expect(fs.existsSync(path.join(tmpDir,'node_modules', 'cordova-android'))).toBe(false);
            
            return fetch('https://github.com/apache/cordova-ios.git', tmpDir, opts);       
        })
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-ios');
            
            return uninstall('cordova-ios', tmpDir, opts);
        })
        .then(function() {
            expect(fs.existsSync(path.join(tmpDir,'node_modules', 'cordova-ios'))).toBe(false);    
        })
        .fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
    }, 60000);
});

describe('platform fetch/uninstall test via npm & git tags with --save', function () {

    var tmpDir = helpers.tmpDir('plat_fetch_save');
    var opts = {'save':true};
    
    beforeEach(function() {
        //copy package.json from spec directory to tmpDir
        shell.cp('spec/testpkg.json', path.join(tmpDir,'package.json'));
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fetch and uninstall a cordova platform via npm & git tags/branches', function(done) {
        fetch('cordova-android@5.1.1', tmpDir, opts)
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-android');
            expect(pkgJSON.version).toBe('5.1.1');

            var rootPJ = require(path.join(tmpDir,'package.json'));
            expect(rootPJ.dependencies['cordova-android']).toBe('^5.1.1');

            return uninstall('cordova-android', tmpDir, opts);
        })
        .then(function() {
            var rootPJ = JSON.parse(fs.readFileSync(path.join(tmpDir,'package.json'), 'utf8'));
            expect(Object.keys(rootPJ.dependencies).length).toBe(0);
            expect(fs.existsSync(path.join(tmpDir,'node_modules', 'cordova-android'))).toBe(false);

            return fetch('https://github.com/apache/cordova-ios.git#rel/4.1.1', tmpDir, opts);       
        })
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-ios');
            expect(pkgJSON.version).toBe('4.1.1');

            var rootPJ = JSON.parse(fs.readFileSync(path.join(tmpDir,'package.json'), 'utf8'));
            expect(rootPJ.dependencies['cordova-ios']).toBe('git+https://github.com/apache/cordova-ios.git#rel/4.1.1');

            return uninstall('cordova-ios', tmpDir, opts);
        })
        .then(function() {
            var rootPJ = JSON.parse(fs.readFileSync(path.join(tmpDir,'package.json'), 'utf8'));
            expect(Object.keys(rootPJ.dependencies).length).toBe(0);
            expect(fs.existsSync(path.join(tmpDir,'node_modules', 'cordova-ios'))).toBe(false);

            return fetch('https://github.com/apache/cordova-android.git#4.1.x', tmpDir, opts);
        })
        .then(function(result) {
            var pkgJSON = JSON.parse(fs.readFileSync(path.join(result,'package.json'), 'utf8'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-android');
            expect(pkgJSON.version).toBe('4.1.1');

            var rootPJ = JSON.parse(fs.readFileSync(path.join(tmpDir,'package.json'), 'utf8'));
            expect(rootPJ.dependencies['cordova-android']).toBe('git+https://github.com/apache/cordova-android.git#4.1.x');

            return uninstall('cordova-android', tmpDir, opts);
        })
        .fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
    }, 70000);
});

describe('plugin fetch/uninstall test with --save', function () {

    var tmpDir = helpers.tmpDir('plug_fetch_save');
    var opts = {'save':true};
    
    beforeEach(function() {
        //copy package.json from spec directory to tmpDir
        shell.cp('spec/testpkg.json', path.join(tmpDir,'package.json'));
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fetch and uninstall a cordova plugin via git commit sha', function(done) {
        fetch('https://github.com/apache/cordova-plugin-contacts.git#7db612115755c2be73a98dda76ff4c5fd9d8a575', tmpDir, opts)
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-plugin-contacts');
            expect(pkgJSON.version).toBe('2.0.2-dev');

            var rootPJ = require(path.join(tmpDir,'package.json'));
            expect(rootPJ.dependencies['cordova-plugin-contacts']).toBe('git+https://github.com/apache/cordova-plugin-contacts.git#7db612115755c2be73a98dda76ff4c5fd9d8a575');

            return uninstall('cordova-plugin-contacts', tmpDir, opts);
        })
        .then(function() {
            var rootPJ = JSON.parse(fs.readFileSync(path.join(tmpDir,'package.json'), 'utf8'));
            expect(Object.keys(rootPJ.dependencies).length).toBe(0);
            expect(fs.existsSync(path.join(tmpDir,'node_modules', 'cordova-plugin-contacts'))).toBe(false);
        })
        .fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
    }, 30000);
});

describe('test trimID method for npm and git', function () {

    var tmpDir = helpers.tmpDir('plug_trimID');
    var opts = {};
    
    beforeEach(function() {
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fetch the same cordova plugin twice in a row', function(done) {
        fetch('cordova-plugin-device', tmpDir, opts)
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-plugin-device');
            
            return fetch('https://github.com/apache/cordova-plugin-media.git', tmpDir, opts);
        })
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('cordova-plugin-media');

            //refetch to trigger trimID
            return fetch('cordova-plugin-device', tmpDir, opts);
            
        })
        .then(function(result) {
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(result).toMatch('cordova-plugin-device');

            //refetch to trigger trimID
            return fetch('https://github.com/apache/cordova-plugin-media.git', tmpDir, opts);
        })
        .then(function(result) {
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(result).toMatch('cordova-plugin-media');

            //refetch to trigger trimID, this time no .git
            return fetch('https://github.com/apache/cordova-plugin-media', tmpDir, opts);
        })
        .then(function(result) {
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(result).toMatch('cordova-plugin-media');
        })
        .fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
    }, 40000);
});

describe('fetch failure with unknown module', function () {

    var tmpDir = helpers.tmpDir('fetch_fails_npm');
    var opts = {};
    
    beforeEach(function() {
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fail fetching a module that does not exist on npm', function(done) {
        fetch('NOTAMODULE', tmpDir, opts)
        .then(function(result) {
            console.log('This should fail and it should not be seen');
        })
        .fail(function(err) {
            expect(err.message.code).toBe(1);
            expect(err).toBeDefined();
        })
        .fin(done);
    }, 30000);
});

describe('fetch failure with git subdirectory', function () {

    var tmpDir = helpers.tmpDir('fetch_fails_subdirectory');
    var opts = {};

    beforeEach(function() {
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fail fetching a giturl which contains a subdirectory', function(done) {
        fetch('https://github.com/apache/cordova-plugins.git#:keyboard', tmpDir, opts)
        .then(function(result) {
            console.log('This should fail and it should not be seen');
        })
        .fail(function(err) {
            expect(err.message.code).toBe(1);
            expect(err).toBeDefined();
        })
        .fin(done);
    }, 30000);
});

describe('scoped plugin fetch/uninstall tests via npm', function () {

    var tmpDir = helpers.tmpDir('scoped_plug_fetch');
    var opts = {};

    beforeEach(function() {
        process.chdir(tmpDir);
    });
    
    afterEach(function() {
        process.chdir(path.join(__dirname, '..'));  // Needed to rm the dir on Windows.
        shell.rm('-rf', tmpDir);
    });

    it('should fetch a scoped plugin from npm', function(done) {       
        fetch('@stevegill/cordova-plugin-device', tmpDir, opts)
        .then(function(result) {
            var pkgJSON = require(path.join(result,'package.json'));
            expect(result).toBeDefined();
            expect(fs.existsSync(result)).toBe(true);
            expect(pkgJSON.name).toBe('@stevegill/cordova-plugin-device');
        })
        .fail(function(err) {
            console.error(err);
            expect(err).toBeUndefined();
        })
        .fin(done);
    }, 30000);
});
