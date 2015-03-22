/*jslint node: true, es5: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var expRecordId, originalExperiment;

var exports = function (server, Code, lab, sessionCookie) {

  lab.suite('Experiments', function () {

    /* Create endpoint */
    lab.test("Create experiment endpoint rejects invalid experiment", function (done) {
      var options = {
        method: "POST",
        url: "/experiments",
        payload: {
          experiment: {
            description: 'lab exp descr'
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

    lab.test("Create experiment endpoint rejects valid experiment for unauthorized user", function (done) {
      var options = {
        method: "POST",
        url: "/experiments",
        payload: {
          experiment: {
            name: 'lab experiment',
            description: 'lab exp descr is pretty much too big',
            tag: 'lab_exp_olo',
            variantCount: 2,
            trackPercent: 100,
            fullOn: false
          }
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    lab.test("Create experiment endpoint creates valid experiment", function (done) {
      var options = {
        method: "POST",
        url: "/experiments",
        payload: {
          experiment: {
            name: 'lab experiment',
            description: 'lab exp descr is pretty much too big',
            tag: 'lab_exp_olo',
            variantCount: 2,
            trackPercent: 100,
            fullOn: false
          }
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var experiment,
          result = response.result,
          payload = options.payload;

        Code.expect(response.statusCode).to.equal(201);
        Code.expect(result).to.be.an.object();

        Code.expect(result.experiment).to.be.an.object();

        expRecordId = result.experiment.id;

        experiment = result.experiment;
        originalExperiment = payload.experiment;

        Code.expect(experiment.name).to.equal(originalExperiment.name);
        Code.expect(experiment.description).to.equal(originalExperiment.description);
        Code.expect(experiment.tag).to.equal(originalExperiment.tag);
        Code.expect(experiment.variantCount).to.equal(originalExperiment.variantCount);
        Code.expect(experiment.trackPercent).to.equal(originalExperiment.trackPercent);
        Code.expect(experiment.fullOn).to.equal(originalExperiment.fullOn);

        done();
      });
    });

    /* Index endpoint */
    lab.test('Experiments endpoint lists present experiments', function (done) {
      var options = {
        method: 'GET',
        url: '/experiments',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.experiments).to.be.instanceof(Array);
        Code.expect(result.experiments.length).to.be.above(0);
        Code.expect(result.experiments[0].id).to.equal(1);
        done();
      });
    });

    lab.test('Experiments endpoint do not lists present experiments for unauthorized user', function (done) {
      var options = {
        method: 'GET',
        url: '/experiments'
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    /* Show endpoint */
    lab.test('Single experiment endpoint return given experiment', function (done) {
      var options = {
        method: 'GET',
        url: '/experiments/' + expRecordId,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.experiment).to.be.an.object();

        Code.expect(result.experiment.name).to.equal(originalExperiment.name);
        Code.expect(result.experiment.description).to.equal(originalExperiment.description);
        Code.expect(result.experiment.tag).to.equal(originalExperiment.tag);
        Code.expect(result.experiment.variantCount).to.equal(originalExperiment.variantCount);
        Code.expect(result.experiment.trackPercent).to.equal(originalExperiment.trackPercent);
        Code.expect(result.experiment.fullOn).to.equal(originalExperiment.fullOn);

        done();
      });
    });

    lab.test('Single experiment endpoint return 404 if no experiment present', function (done) {
      var options = {
        method: 'GET',
        url: '/experiments/' + 999,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Single experiment endpoint return 401 if user is unauthorized', function (done) {
      var options = {
        method: 'GET',
        url: '/experiments/' + expRecordId
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    /* Delete endpoint */

    lab.test('Delete experiment endpoint should return 401 error if user is unauthorized', function (done) {
      var options = {
        method: 'DELETE',
        url: '/experiments/' + expRecordId
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    lab.test('Delete experiment endpoint should delete given experiment', function (done) {
      var options = {
        method: 'DELETE',
        url: '/experiments/' + expRecordId,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();
        Code.expect(result.message).to.equal("Experiment deleted successfully");

        done();
      });
    });

    lab.test('Delete experiment endpoint should return error if experiment with given id doesn\'t exists', function (done) {
      var options = {
        method: 'DELETE',
        url: '/experiments/0',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Delete experiment endpoint should return 400 error if experiment id is wrong', function (done) {
      var options = {
        method: 'DELETE',
        url: '/experiments/-1',
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
