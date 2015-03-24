/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var Boom     = require('boom');                            // HTTP Errors
var Joi      = require('joi');                             // Validation
var sqlGoal  = require('../models').Goal;                  // Sequilize ORM


var index = function (server) {
  var Project, User, limit, offset;

  // GET /goals
  server.route({
    method: 'GET',
    path: '/projects/{project_id}/goals',
    config: {
      description: "Gets all the goals from MongoDb and returns them.",
      validate: {
        params: {
          project_id: Joi.number().integer().min(0).required()
        },
        query: {
          limit: Joi.number().integer().min(0).optional(),
          offset: Joi.number().integer().min(0).optional()
        }
      }
    },
    handler: function (request, reply) {
      User = request.auth.credentials;

      limit = request.query.limit || 10;
      offset = request.query.offset || 0;

      // console.log('limit is', limit, 'and offset is', offset);

      User.getProjects({
        where: {
          id: request.params.project_id
        },
        limit: 1
      }).then(function (projects) {
        if (projects.length > 0) {
          Project = projects[0];
          sqlGoal.findAndCountAll({
            where: {
              ProjectId: Project.id
            },
            offset: offset,
            limit: limit
          }).then(function (result) {
            if (result.rows) {
              reply({
                goals: result.rows,
                meta: {
                  total: result.total
                }
              });
            } else {
              reply(Boom.notFound());
            }
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        } else {
          reply(Boom.notFound());
        }
      }, function (err) {
        reply(Boom.badImplementation(err)); // 500 error
      });
    }
  });
};


/**
 * POST /goals
 * Creates a new experiment in the datastore.
 *
 * @param server - The Hapi Serve
 */
var create = function (server) {
  // POST /experiments
  var reqGoal, User, Project;

  server.route({
    method: 'POST',
    path: '/projects/{project_id}/goals',
    config: {
      description: "Creating a single goal based on POST data",
      validate: {
        params: {
          project_id: Joi.number().integer().min(0).required()
        },
        payload: {
          goal: Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            description: Joi.string().min(3).max(3000).required(),
            tag: Joi.string().min(3).max(100).required()
          })
        }
      }
    },
    handler: function (request, reply) {
      reqGoal = request.payload.goal;
      User = request.auth.credentials;

      User.getProjects({
        where: {
          id: request.params.project_id
        },
        limit: 1
      }).then(function (projects) {
        if (projects.length > 0) {
          Project = projects[0];
          Project.createGoal(reqGoal).then(function (goal) {
            reply({goal: goal}).created('/projects/' + request.params.project_id + '/goal/' + goal.id);    // HTTP 201
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        } else {
          reply(Boom.notFound());
        }
      }, function (err) {
        reply(Boom.badImplementation(err)); // 500 error
      })
    }
  });
};


/**
 * PUT /experiments/{id}
 * Creates a new experiment in the datastore.
 *
 * @param server - The Hapi Serve
 */
var update = function (server) {
  var reqGoal, User, Project;

  server.route({
    method: 'PUT',
    path: '/projects/{project_id}/goals/{id}',
    config: {
      description: "Update a single goal based on PUT data",
      validate: {
        params: {
          project_id: Joi.number().integer().min(0).required()
        },
        payload: {
          goal: Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            description: Joi.string().min(3).max(3000).required(),
            tag: Joi.string().min(3).max(100).required()
          })
        }
      }
    },
    handler: function (request, reply) {
      reqGoal = request.payload.goal;
      reqExp.id = Number(request.params.id);

      server.methods.getGoalForRequest(request, function (err, Goal) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound()); // 404 error
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        } else {
          Goal.update(reqGoal).then(function (newExp) {
            reply({goal: reqGoal})  // HTTP 200
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        }
      });
    }
  });
};


/**
 * GET /goals/{id}
 * Gets the goal based upon the {id} parameter.
 *
 * @param server
 */
var show = function (server) {

  server.route({
    method: 'GET',
    path: '/projects/{project_id}/goals/{id}',
    config: {
      description: "Gets the goal based upon the {id} parameter.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required(),
          project_id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      server.methods.getGoalForRequest(request, function (err, Goal) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound()); // 404 error
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        } else {
          reply({goal: Goal});
        }
      });

    }
  });
};


/**
 * DELETE /experiments/{id}
 * Deletes an experiment, based on the experiment id in the path.
 *
 * @param server - The Hapi Server
 */
var remove = function (server) {
  server.route({
    method: 'DELETE',
    path: '/projects/{project_id}/goals/{id}',
    config: {
      description: "Deletes a goal, based on the goal id in the path.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required(),
          project_id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      server.methods.getGoalForRequest(request, function (err, Goal) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound()); // 404 error
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        } else {
          Goal.destroy().then(function (deleted) {
            if (deleted) {
              reply({message: "Goal deleted successfully"});
            } else {
              reply(Boom.notFound("Could not delete Goal")); // 404 error
            }
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        }
      });
    }
  });
};


module.exports = function (server) {
  index(server);
  create(server);
  show(server);
  remove(server);
  update(server);
};
