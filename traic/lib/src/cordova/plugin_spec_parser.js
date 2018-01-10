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

// npm packages follow the pattern of (@scope/)?package(@spec)? where scope and tag are optional
var NPM_SPEC_REGEX = /^(@[^\/]+\/)?([^@\/]+)(?:@(.+))?$/;

module.exports.parse = parse;

/**
 * Represents a parsed specification for a plugin
 * @class
 * @param {String} raw      The raw specification (i.e. provided by the user)
 * @param {String} scope    The scope of the package if this is an npm package
 * @param {String} id       The id of the package if this is an npm package
 * @param {String} version  The version specified for the package if this is an npm package
 */
function PluginSpec(raw, scope, id, version) {
    /** @member {String|null} The npm scope of the plugin spec or null if it does not have one */
    this.scope = scope || null;

    /** @member {String|null} The id of the plugin or the raw plugin spec if it is not an npm package */
    this.id = id || raw;

    /** @member {String|null} The specified version of the plugin or null if no version was specified */
    this.version = version || null;

    /** @member {String|null} The npm package of the plugin (with scope) or null if this is not a spec for an npm package */
    this.package = (scope ? scope + id : id) || null;
}

/**
 * Tries to parse the given string as an npm-style package specification of
 * the form (@scope/)?package(@version)? and return the various parts.
 *
 * @param {String} raw  The string to be parsed
 * @return {PluginSpec}  The parsed plugin spec
 */
function parse(raw) {
    var split = NPM_SPEC_REGEX.exec(raw);
    if (split) {
        return new PluginSpec(raw, split[1], split[2], split[3]);
    }

    return new PluginSpec(raw);
}
