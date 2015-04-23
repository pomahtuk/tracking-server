/*jslint node: true, indent: 2*/

'use strict';

var getGoalForRequest = function (server) {
  var User, Project, Goal;

  server.method('getGoalForRequest', function (request, next) {
    User = request.auth.credentials;

    User.getProjects({
      where: {
        id: request.params.project_id
      },
      limit: 1
    }).then(function (projects) {
      if (projects.length > 0) {
        Project = projects[0];
        Project.getGoals({
          where: {
            id: request.params.id
          },
          limit: 1
        }).then(function (goals) {
          if (goals.length > 0) {
            Goal = goals[0];
            next(null, Goal);
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
  getGoalForRequest(server);
};


module.exports = exports;
