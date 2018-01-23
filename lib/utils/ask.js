'use strict';

var async = require('async');
var inquirer = require('inquirer');
var evaluate = require('./eval');

// Support types from prompt-for which was used before
var promptMapping = {
  string: 'input',
  boolean: 'confirm'
};

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

var prompt = function prompt(data, key, _prompt, done) {
  // skip prompts whose when condition is not met
  if (_prompt.when && !evaluate(_prompt.when, data)) {
    return done();
  }

  var promptDefault = _prompt.default;
  if (typeof _prompt.default === 'function') {
    promptDefault = function promptDefault() {
      return _prompt.default.bind(this)(data);
    };
  }

  inquirer.prompt([{
    type: promptMapping[_prompt.type] || _prompt.type,
    name: key,
    message: _prompt.message || _prompt.label || key,
    default: promptDefault,
    choices: _prompt.choices || [],
    validate: _prompt.validate || function () {
      return true;
    }
  }]).then(function (answers) {
    if (Array.isArray(answers[key])) {
      data[key] = {};
      answers[key].forEach(function (multiChoiceAnswer) {
        data[key][multiChoiceAnswer] = true;
      });
    } else if (typeof answers[key] === 'string') {
      data[key] = answers[key].replace(/"/g, '\\"');
    } else {
      data[key] = answers[key];
    }
    done();
  }).catch(done);
};

/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */
var ask = function ask(prompts, data, done) {
  async.eachSeries(Object.keys(prompts), function (key, next) {
    prompt(data, key, prompts[key], next);
  }, done);
};

module.exports = {
  ask: ask
};