/*jslint node: true, es5: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var expRecordId, originalExperiment, coreProject;
var validExperiment = {
  name: 'lab experiment',
  description: 'lab exp descr is pretty much too big',
  tag: 'lab_exp_olo',
  variantCount: 2,
  trackPercent: 100,
  fullOn: false
};


var exports = function (server, Code, lab, sessionCookie) {

  lab.suite('Experiments', function () {

    // create a project
    lab.before(function (done) {
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

      server.inject(options, function () {
        done();
      });
    })

    /* Create endpoint */
    lab.test("Create experiment endpoint rejects invalid experiment", function (done) {
      var options = {
        method: "POST",
        url: "/projects/" + coreProject.id + "/experiments",
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

    lab.test("Create experiment endpoint rejects experiment if project id is wrong", function (done) {
      var options = {
        method: "POST",
        url: "/projects/" + 11111111 + "/experiments",
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
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test("Create experiment endpoint rejects valid experiment for unauthorized user", function (done) {
      var options = {
        method: "POST",
        url: "/projects/" + coreProject.id + "/experiments",
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
        url: "/projects/" + coreProject.id + "/experiments",
        payload: {
          experiment: validExperiment
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
        url: "/projects/" + coreProject.id + '/experiments',
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
        done();
      });
    });

    // add pagination tests

    lab.test('Experiments endpoint do not lists present experiments for unauthorized user', function (done) {
      var options = {
        method: 'GET',
        url: "/projects/" + coreProject.id + '/experiments'
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
        url: "/projects/" + coreProject.id + '/experiments/' + expRecordId,
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
        url: "/projects/" + coreProject.id + '/experiments/' + 999,
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Single experiment endpoint return 404 if no project present', function (done) {
      var options = {
        method: 'GET',
        url: "/projects/" + 11111 + '/experiments/' + 999,
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
        url: "/projects/" + coreProject.id + '/experiments/' + expRecordId
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    /* Update endpoint */
    lab.test('Update experiment endpoint should return 401 error if user is unauthorized', function (done) {
      validExperiment.description = 'this is edited experiment descr';
      var options = {
        method: 'PUT',
        url: "/projects/" + coreProject.id + '/experiments/' + expRecordId,
        payload: {
          experiment: validExperiment
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    lab.test('Update experiment endpoint should update given experiment', function (done) {
      var options = {
        method: 'PUT',
        url: "/projects/" + coreProject.id + '/experiments/' + expRecordId,
        payload: {
          experiment: validExperiment
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        var experiment,
          result = response.result;

        Code.expect(response.statusCode).to.equal(200);
        Code.expect(result).to.be.an.object();

        Code.expect(result.experiment).to.be.an.object();

        experiment = result.experiment;

        Code.expect(experiment.name).to.equal(validExperiment.name);
        Code.expect(experiment.description).to.equal(validExperiment.description);
        Code.expect(experiment.tag).to.equal(validExperiment.tag);
        Code.expect(experiment.variantCount).to.equal(validExperiment.variantCount);
        Code.expect(experiment.trackPercent).to.equal(validExperiment.trackPercent);
        Code.expect(experiment.fullOn).to.equal(validExperiment.fullOn);

        done();
      });
    });

    lab.test('Update experiment endpoint should return error if experiment with given id doesn\'t exists', function (done) {
      var options = {
        method: 'PUT',
        url: "/projects/" + coreProject.id + '/experiments/0',
        payload: {
          experiment: validExperiment
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Update experiment endpoint should return error if project with given id doesn\'t exists', function (done) {
      var options = {
        method: 'PUT',
        url: "/projects/" + 11111 + '/experiments/0',
        payload: {
          experiment: validExperiment
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Update experiment endpoint should return 400 error if experiment id is wrong', function (done) {
      var options = {
        method: 'PUT',
        url: "/projects/" + coreProject.id + '/experiments/-1',
        payload: {
          experiment: validExperiment
        },
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    /* Delete endpoint */
    lab.test('Delete experiment endpoint should return 401 error if user is unauthorized', function (done) {
      var options = {
        method: 'DELETE',
        url: "/projects/" + coreProject.id + '/experiments/' + expRecordId
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });

    lab.test('Delete experiment endpoint should delete given experiment', function (done) {
      var options = {
        method: 'DELETE',
        url: "/projects/" + coreProject.id + '/experiments/' + expRecordId,
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

    lab.test('Delete experiment endpoint should return error if project with given id doesn\'t exists', function (done) {
      var options = {
        method: 'DELETE',
        url: "/projects/" + 11111 + '/experiments/0',
        headers: {
          cookie: 'sid=' + sessionCookie.value
        }
      };

      server.inject(options, function (response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });

    lab.test('Delete experiment endpoint should return error if experiment with given id doesn\'t exists', function (done) {
      var options = {
        method: 'DELETE',
        url: "/projects/" + coreProject.id + '/experiments/0',
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
        url: "/projects/" + coreProject.id + '/experiments/-1',
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
