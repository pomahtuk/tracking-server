/*jslint node: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var sessionCookie,
  valudUser = {
    username: 'pman' + Date.now(),
    password: '177591',
    confirm: '177591'
  },
  newPassword = '123456';

var exports = function (server, Code, lab) {
  lab.suite('Auth', function () {

    /* Sing-in route */

    lab.test('Creates a user when valid data is provided', function (done) {

      var options = {
        method: 'POST',
        url: '/sign-up',
        payload: valudUser
      };

      server.inject(options, function (response) {
        var result = response.result;
        var header = response.headers['set-cookie'];
        Code.expect(header.length).to.equal(1);

        sessionCookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\'\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\'\,\;\\\x7F]*))/);

        Code.expect(result.user.username).to.equal(valudUser.username);
        Code.expect(response.statusCode).to.equal(201);

        done();
      });

    });

    lab.test('Rejects creation of allready existing valid user', function (done) {

      var options = {
        method: 'POST',
        url: '/sign-up',
        payload: valudUser
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });

    });

    /* Auth route */

    lab.test('Authenticate a user', function (done) {

      var options = {
        method: 'POST',
        url: '/login',
        payload: {
          username: valudUser.username,
          password: '177591'
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);

        Code.expect(result.user.username).to.equal(valudUser.username);
        done();
      });

    });

    lab.test('Return error if credentials are invalid', function (done) {

      var options = {
        method: 'POST',
        url: '/login',
        payload: {
          username: valudUser.username,
          password: valudUser.password + '1',
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });

    });

    /* Get user details route */

    lab.test('Gets authenticated user details', function (done) {

      var options = {
        method: 'GET',
        url: '/me',
        headers: {
          cookie: 'sid=' + sessionCookie[1]
        }
      };

      server.inject(options, function (response) {
        var result = response.result;
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result.user.username).to.equal(valudUser.username);
        done();
      });

    });

    lab.test('Do not return any details to unauthenticated user', function (done) {

      var options = {
        method: 'GET',
        url: '/me'
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });

    });

    /* Change user password route */

    /* Change user password route */
    lab.test('Change password route return an error for incorrect data', function (done) {

      var options = {
        method: 'POST',
        url: '/change-password',
        payload: {
          oldPassword: valudUser.password + '1',
          newPassword: newPassword,
          confifm: newPassword
        },
        headers: {
          cookie: 'sid=' + sessionCookie[1]
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });

    });

    lab.test('Change password route return an error for unauthenticated user', function (done) {

      var options = {
        method: 'POST',
        url: '/change-password',
        payload: {
          oldPassword: valudUser.password,
          newPassword: newPassword,
          confifm: newPassword
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });

    });


    lab.test('Change password route sucessfully changes a password for user with correct data', function (done) {

      var options = {
        method: 'POST',
        url: '/change-password',
        payload: {
          oldPassword: valudUser.password,
          newPassword: newPassword,
          confifm: newPassword
        },
        headers: {
          cookie: 'sid=' + sessionCookie[1]
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.message).to.equal('User password updated successfully');
        done();
      });

    });

    /* DELETE user testing */

    lab.test('Delete route shoud return error if usser session is invalid', function (done) {

      var options = {
        method: 'DELETE',
        url: '/account',
        payload: {
          password: valudUser.password + '1'
        },
        headers: {
          cookie: 'sid=' + sessionCookie[1] + '111111'
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });

    });

    lab.test('Return error for authenticated user with wrong password', function (done) {

      var options = {
        method: 'DELETE',
        url: '/account',
        payload: {
          password: valudUser.password + '1'
        },
        headers: {
          cookie: 'sid=' + sessionCookie[1]
        }
      };

      server.inject(options, function (response) {
        var result = response.result;
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(result.message).to.equal('Wrong password');
        done();
      });

    });

    lab.test('Return error for unauthenticated user', function (done) {

      var options = {
        method: 'DELETE',
        url: '/account'
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });

    });

    lab.test('Deletes authenticated user with right password', function (done) {

      var options = {
        method: 'DELETE',
        url: '/account',
        payload: {
          password: newPassword
        },
        headers: {
          cookie: 'sid=' + sessionCookie[1]
        }
      };

      server.inject(options, function (response) {
        var result = response.result;
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result.message).to.equal('User deleted successfully');
        done();
      });

    });

  });
};

module.exports = exports;
