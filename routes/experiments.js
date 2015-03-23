/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var Boom            = require('boom');                                  // HTTP Errors
var Joi             = require('joi');                                   // Validation
var sqlExperiment   = require('../models').Experiment;                  // Sequilize ORM


/**
 * GET /experiments
 * Gets all the experiments from MongoDb and returns them.
 * TODO: add pagination
 *
 * @param server - The Hapi Server
 */
var index = function (server) {
  var Project, User, limit, offset;

  // GET /experiments
  server.route({
    method: 'GET',
    path: '/projects/{project_id}/experiments',
    config: {
      description: "Gets all the experiments from MongoDb and returns them.",
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
          sqlExperiment.findAndCountAll({
            where: {
              ProjectId: Project.id
            },
            offset: offset,
            limit: limit
          }).then(function (result) {
            if (result.rows) {
              reply({
                experiments: result.rows,
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
 * POST /new
 * Creates a new experiment in the datastore.
 *
 * @param server - The Hapi Serve
 */
var create = function (server) {
  // POST /experiments
  var reqExp, User, Project;

  server.route({
    method: 'POST',
    path: '/projects/{project_id}/experiments',
    config: {
      description: "Creating a single experiment based on POST data",
      validate: {
        params: {
          project_id: Joi.number().integer().min(0).required()
        },
        payload: {
          experiment: Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            description: Joi.string().min(3).max(3000).required(),
            tag: Joi.string().min(3).max(100).required(),
            variantCount: Joi.number().integer().min(2).max(10).required(),
            trackPercent: Joi.number().integer().min(1).max(100).required(),
            fullOn: Joi.boolean().optional(),
            goal: Joi.optional(),
            dateCreated: Joi.optional()
          })
        }
      }
    },
    handler: function (request, reply) {
      reqExp = request.payload.experiment;
      User = request.auth.credentials;

      User.getProjects({
        where: {
          id: request.params.project_id
        },
        limit: 1
      }).then(function (projects) {
        if (projects.length > 0) {
          Project = projects[0];
          Project.createExperiment(reqExp).then(function (experiment) {
            reply({experiment: experiment}).created('/projects' + request.params.project_id + '/experiments/' + experiment.id);    // HTTP 201
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
  var reqExp, User, Project, Experiment;

  server.route({
    method: 'PUT',
    path: '/projects/{project_id}/experiments/{id}',
    config: {
      description: "Update a single experiment based on PUT data",
      validate: {
        payload: {
          experiment: Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            description: Joi.string().min(3).max(3000).required(),
            tag: Joi.string().min(3).max(100).required(),
            variantCount: Joi.number().integer().min(2).max(10).required(),
            trackPercent: Joi.number().integer().min(1).max(100).required(),
            fullOn: Joi.boolean().optional(),
            goal: Joi.optional(),
            dateCreated: Joi.optional()
          })
        }
      }
    },
    handler: function (request, reply) {
      reqExp = request.payload.experiment;
      reqExp.id = Number(request.params.id);

      server.methods.getExperimentForRequest(request, function (err, Experiment) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound()); // 404 error
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        } else {
          Experiment.update(reqExp).then(function (newExp) {
            reply({experiment: newExp})  // HTTP 200
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        }
      });
    }
  });
};


/**
 * GET /experiments/{id}
 * Gets the experiment based upon the {id} parameter.
 *
 * @param server
 */
var show = function (server) {
  server.route({
    method: 'GET',
    path: '/projects/{project_id}/experiments/{id}',
    config: {
      description: "Gets the experiment based upon the {id} parameter.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required(),
          project_id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      server.methods.getExperimentForRequest(request, function (err, Experiment) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound()); // 404 error
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        } else {
          reply({experiment: Experiment});
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
    path: '/projects/{project_id}/experiments/{id}',
    config: {
      description: "Deletes an experiment, based on the experiment id in the path.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required(),
          project_id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      server.methods.getExperimentForRequest(request, function (err, Experiment) {
        if (err) {
          if (err.message === 'Not found') {
            reply(Boom.notFound()); // 404 error
          } else {
            reply(Boom.badImplementation(err)); // 500 error
          }
        } else {
          Experiment.destroy().then(function (deleted) {
            if (deleted) {
              reply({message: "Experiment deleted successfully"});
            } else {
              reply(Boom.notFound("Could not delete Experiment")); // 404 error
            }
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        }
      });
    }
  });
};


var exports = function (server) {
  index(server);
  create(server);
  update(server);
  show(server);
  remove(server);
};


module.exports = exports;
