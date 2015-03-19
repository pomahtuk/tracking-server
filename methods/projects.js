var sqlProject   = require('../models').Project;                  // Sequilize ORM

function findProjectById (projectId, next) {
  sqlProject.findOne(request.params.id).then(function (project) {
    next(null, project);
  }, function(err) {
    next(err, null);
  });
}

exports.init = function (server) {
   server.method("getProject", findProjectById)
}