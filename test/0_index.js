var sessionCookie,
  Lab     = require('lab'),
  Code    = require('code'),
  server  = require('../server.js');
  lab     = Lab.script(),
  testUser = {
    username: 'pman_valid_' + Date.now(),
    password: '177591',
    confirm: '177591'
  };

var authTests = require('./auth.js');
var projectsTests = require('./projects.js');
var experimentsTests = require('./experiments.js');
var goalsTests = require('./goals.js');

lab.suite('Laborant Server', function () {
  // wait for models to be loaded
  lab.before(function (done) {
    setTimeout(function () {

      // var options = {
      //   method: "POST",
      //   url: "/sign-up",
      //   payload: testUser
      // };

      // // register user and use cookies for testing hidden routes
      // server.inject(options, function(response) {

      //   var result = response.result;
      //   var header = response.headers['set-cookie'];

      //   console.log(header, response.statusCode);

      //   if (header && header.length > 0) {
      //     sessionCookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);
      //     sessionCookie = sessionCookie[1];
      //   }

      //   done();

      // });
      // 
      var options = {
        method: "POST",
        url: "/sign-up",
        payload: testUser
      };

      server.inject(options, function(response) {
        var result = response.result;
        var header = response.headers['set-cookie'];

        Code.expect(header).to.be.an.array();
        Code.expect(header.length).to.equal(1);

        sessionCookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);

        Code.expect(result.user.username).to.equal(testUser.username);
        Code.expect(response.statusCode).to.equal(201);

        sessionCookie = sessionCookie[1];

        done();
      });

    }, 1000);



  });

  authTests(server, Code, lab);
  projectsTests(server, Code, lab, sessionCookie);
  experimentsTests(server, Code, lab, sessionCookie);
  goalsTests(server, Code, lab, sessionCookie);

});


exports.lab = lab;