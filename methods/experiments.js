/*jslint node: true, indent: 2*/

'use strict';

var getExperimentForRequest = function (server) {
  var User, Project, Experiment;

  server.method('getExperimentForRequest', function (request, next) {
    User = request.auth.credentials;

    User.getProjects({
      where: {
        id: request.params.project_id
      },
      limit: 1
    }).then(function (projects) {
      if (projects.length > 0) {
        Project = projects[0];
        Project.getExperiments({
          where: {
            id: request.params.id
          },
          limit: 1
        }).then(function (experiments) {
          if (experiments.length > 0) {
            Experiment = experiments[0];
            next(null, Experiment);
          } else {
            next(new Error('Not found'));
          }
        }, function (err) {
          next(err);
        });
      } else {
        next(new Error('Not found'));
      }
    }, function (err) {
      next(err);
    });
  });
};

var exports = function (server) {
  getExperimentForRequest(server);
};


module.exports = exports;
