/*jslint node: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var shell = require('shelljs');
var coreProject;

var exports = function (server, Code, lab, sessionCookie) {
  lab.suite('Generic actions', function () {

    // create a project
    lab.before(function (done) {
      var options = {
        method: 'POST',
        url: '/projects',
        payload: {
          project: {
            name: 'lab project',
            description: 'lab project descr is pretty much too big',
            domain: 'http://ya.ru'
          }
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      // creating a test user and getting auth cookie
      server.inject(options, function (response) {
        var result = response.result;
        coreProject = result.project;
        done();
      });
    });

    // and delete a project
    lab.after(function (done) {
      var options = {
        method: 'DELETE',
        url: '/projects/' + coreProject.id,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      // cleanup file
      shell.exec('rm -Rf ' + __dirname + '/../public/' + coreProject.apiKey);


      server.inject(options, function () {
        done();
      });
    });


    lab.test('Get script url should return 404 if api key is wrong', function (done) {
      var options = {
        method: 'GET',
        url: '/' + coreProject.apiKey + '1111/laborant.js',
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });


    lab.test('Get script url should return js file contents', function (done) {
      var options = {
        method: 'GET',
        url: '/' + coreProject.apiKey + '/laborant.js',
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });


    lab.test('Get script url should return js file contents if file is allready created', function (done) {
      var options = {
        method: 'GET',
        url: '/' + coreProject.apiKey + '/laborant.js',
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });


    lab.test('Get script url should return js file contents if template file were modified', function (done) {
      var options = {
        method: 'GET',
        url: '/' + coreProject.apiKey + '/laborant.js',
      };

      shell.exec('touch ' + __dirname + '/../public/laborant.template.js');

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });

  });
};

module.exports = exports;
