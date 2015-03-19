var sessionCookie,
  valudUser = {
    username: 'pman' + Date.now(),
    password: '177591',
    confirm: '177591'
  };

module.exports = exports = function (server, Code, lab) {
  lab.suite('Auth', function () {

    lab.test('Creates a user when valid data is provided', function (done) {

        var options = {
          method: "POST",
          url: "/sign-up",
          payload: valudUser
        };

        server.inject(options, function(response) {
          var result = response.result;
          var header = response.headers['set-cookie'];
          Code.expect(header.length).to.equal(1);

          sessionCookie = header[0].match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/);

          Code.expect(result.user.username).to.equal(valudUser.username);
          Code.expect(response.statusCode).to.equal(201);

          done();
        });

    });

    lab.test('Rejects creation of allready existing valid user', function (done) {

        var options = {
          method: "POST",
          url: "/sign-up",
          payload: valudUser
        };

        server.inject(options, function(response) {
          Code.expect(response.statusCode).to.equal(400);
          done();
        });

    });

    lab.test('Authenticates a user', function (done) {

        var options = {
          method: "POST",
          url: "/login",
          payload: {
            username: valudUser.username,
            password: '177591'
          }
        };

        server.inject(options, function(response) {
          var result = response.result;

          Code.expect(response.statusCode).to.equal(200);

          Code.expect(result.user.username).to.equal(valudUser.username);
          done();
        });

    });

    lab.test('Deletes valid user with propper password', function (done) {

        var options = {
          method: "Delete",
          url: "/account",
          payload: {
            password: '177591'
          },
          headers: {
            cookie: 'sid=' + sessionCookie[1]
          }
        };

        server.inject(options, function(response) {
          Code.expect(response.statusCode).to.equal(200);
          done();
        });

    });

  });
}
