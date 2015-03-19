"use strict";

var Lab     = require('lab');
var Code    = require('code');
var server  = require('../server.js');
var fs        = require("fs");
var path      = require("path");
var basename  = path.basename(module.filename);

// defining a local variables
var that = this;
var testsObject = {};
var sessionCookie = {};

// valid user we are going to register
that.testUser = {
  username: 'pmanValid' + Date.now(),
  password: '177591',
  confirm: '177591'
};
// saving reference like this to prevent leaking
that.lab = Lab.script();

// wrapping in hight level test suite
that.lab.suite('Laborant Server', function () {
  // wait for models to be loaded
  that.lab.before(function (done) {
    // actually waiting 1 secod for server to be started
    setTimeout(function () {

      var options = {
        method: "POST",
        url: "/sign-up",
        payload: that.testUser
      };

      // creating a test user and getting auth cookie
      server.inject(options, function(response) {

        if (response.statusCode !== 201 ) {
          console.log('Wrong response', response.payload, 'with code', response.statusCode);
        }

        var result = response.result;
        var header = response.headers['set-cookie'];
        var thisSessionCookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);

        // setting value of cookie
        sessionCookie.value = thisSessionCookie[1];

        done();
      });

    }, 1000);

  });

  // loading all tests within the same directory
  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== basename);
    })
    .forEach(function(file) {
      var test = require(path.join(__dirname, file));
      testsObject[file] = test;
    });

  // and executing them with propper perematers
  Object.keys(testsObject).forEach(function(testName) {
    testsObject[testName](server, Code, that.lab, sessionCookie);
  });

});

// we are done, export our results
exports.lab = that.lab;
