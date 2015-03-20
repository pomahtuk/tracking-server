/*jslint node: true, es5: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var projRecordId, originalProject;

var exports = function (server, Code, lab, sessionCookie) {

  lab.suite('Projects', function () {

    lab.test("Create project endpoint rejects invalid project", function (done) {

      var options = {
        method: "POST",
        url: "/projects",
        payload: {
          project: {
            description: 'lab proj descr'
          }
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(400);
        Code.expect(result).to.be.an.object();
        Code.expect(result.message).to.be.string();

        done();
      });
    });

    lab.test("Create project endpoint creates valid project", function (done) {
      var options = {
        method: "POST",
        url: "/projects",
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

      server.inject(options, function (response) {
        var project,
          result = response.result,
          payload = options.payload;

        Code.expect(response.statusCode).to.equal(201);
        Code.expect(result).to.be.an.object();

        Code.expect(result.project).to.be.an.object();

        projRecordId = result.project.id;

        project = result.project;
        originalProject = payload.project;

        Code.expect(project.name).to.equal(originalProject.name);
        Code.expect(project.description).to.equal(originalProject.description);
        Code.expect(project.domain).to.equal(originalProject.domain);

        done();
      });
    });

    // test index
    lab.test('Projects endpoint lists present projects', function (done) {
      var options = {
        method: 'GET',
        url: '/projects',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.projects).to.be.instanceof(Array);
        Code.expect(result.projects.length).to.be.above(0);

        done();
      });
    });

    lab.test('Single project endpoint return given project', function (done) {
      var options = {
        method: 'GET',
        url: '/projects/' + projRecordId,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.project).to.be.an.object();

        Code.expect(result.project.name).to.equal(originalProject.name);
        Code.expect(result.project.description).to.equal(originalProject.description);
        Code.expect(result.project.domain).to.equal(originalProject.domain);

        done();
      });
    });

    lab.test('Delete project endpoint should delete given project', function (done) {
      var options = {
        method: 'DELETE',
        url: '/projects/' + projRecordId,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.message).to.equal("Project deleted successfully");

        done();
      });
    });

    lab.test('Delete project endpoint should return error if project with given id doesn\'t exists', function (done) {
      var options = {
        method: 'DELETE',
        url: '/projects/0',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Delete project endpoint should return 400 error if project id is wrong', function (done) {
      var options = {
        method: 'DELETE',
        url: '/projects/-1',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });

  });
};

module.exports = exports;
