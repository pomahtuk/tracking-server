var expRecordId, originalExperiment,
  Code  = require('code'),
  Lab     = require('lab'),
  server  = require('../server.js'),
  lab     = exports.lab = Lab.script();

lab.suite('Experiments', function () {
  // test index
  lab.test('Experiments endpoint lists present experiments', function (done) {
    var options = {
      method: 'GET',
      url: '/experiments'
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.an.object();
      Code.expect(result.experiments).to.be.instanceof(Array);
      Code.expect(result.experiments.length).to.be.above(0);

      done();
    });
  });

  lab.test("Create experiment endpoint creates valid experiment", function(done) {
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

    server.inject(options, function(response) {
      var experiment,
        result = response.result,
        payload = options.payload;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.an.object();

      Code.expect(result.experiment).to.be.an.object();

      expRecordId = result.experiment._id;

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

  lab.test("Create experiment endpoint rejects invalid experiment", function(done) {
    var options = {
      method: "POST",
      url: "/experiments",
      payload: {
        experiment: {
          description: 'lab exp descr'
        }
      }
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(400);
      Code.expect(result).to.be.an.object();
      Code.expect(result.message).to.be.string();

      done();
    });
  });

  lab.test('Single experiment endpoint return given experiment', function (done) {
    var options = {
      method: 'GET',
      url: '/experiments/' + expRecordId
    };

    server.inject(options, function(response) {
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

  lab.test('Delete experiment endpoint should delete given experiment', function (done) {
    var options = {
      method: 'DELETE',
      url: '/experiments/' + expRecordId
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.an.object();
      Code.expect(result.message).to.equal("Experiment deleted successfully");

      done();
    });
  });

  lab.test('Delete experiment endpoint should return error if experiment with givenid doesn\'t exists', function (done) {
    var options = {
      method: 'DELETE',
      url: '/experiments/00036acb9ea6953b8ef244d0'
    };

    server.inject(options, function(response) {
      Code.expect(response.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('Delete experiment endpoint should return 400 error if experiment id is wrong', function (done) {
    var options = {
      method: 'DELETE',
      url: '/experiments/' + 0000
    };

    server.inject(options, function(response) {
      Code.expect(response.statusCode).to.equal(400);
      done();
    });
  });

});
