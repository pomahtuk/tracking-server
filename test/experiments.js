var Code  = require('code'),
  Lab     = require('lab'),
  server  = require('../server.js'),
  lab     = exports.lab = Lab.script();

lab.experiment('Experiments', function () {
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

  lab.test("Creating valid experiment", function(done) {
    var options = {
      method: "POST",
      url: "/experiments",
      payload: {
        experiment: {
          name: 'lab experiment',
          description: 'lab exp descr',
          tag: 'lab_exp',
          variantCount: 2,
          trackPercent: 100,
          fullOn: false
        }
      }
    };

    server.inject(options, function(response) {
      var experiment, originalExperiment,
        result = response.result,
        payload = options.payload;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.an.object();

      Code.expect(result.experiment).to.be.an.object();

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


});
