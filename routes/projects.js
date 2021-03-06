/*jslint node: true, nomen: true, indent: 2*/

'use strict';

var Boom            = require('boom');                               // HTTP Errors
var Joi             = require('joi');                                // Validation
var uuid            = require('node-uuid');           // generate RFC UUID

var validPayload = {
  project: Joi.object().keys({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(3).max(3000).required(),
    domain: Joi.string().min(3).max(100).required(),
    apiKey: Joi.string().optional(),
    updatedAt: Joi.optional(),
    createdAt: Joi.optional()
  })
};

/**
 * GET /projects
 * Gets all the projects from DB and returns them.
 * TODO: add pagination
 *
 * @param server - The Hapi Server
 */
var index = function (server) {
  var User, limit, offset;

  // GET /projects
  server.route({
    method: 'GET',
    path: '/projects',
    config: {
      description: 'Gets all the projects from DB and returns them.',
      auth: {
        mode: 'required',
        strategy: 'session'
      },
      validate: {
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

      User.getProjects({
        limit: limit,
        offset: offset
      }).then(function (projects) {
        reply({
          projects: projects
        });
      }, function (err) {
        reply(Boom.badImplementation(err)); // 500 error
      });
    }
  });
};


/**
 * POST /projects
 * Creates a new experiment in the datastore.
 *
 * @param server - The Hapi Serve
 */
var create = function (server) {
  // POST /projects
  var reqProj, User;

  server.route({
    method: 'POST',
    path: '/projects',
    config: {
      description: 'Creating a single project based on POST data',
      auth: {
        mode: 'required',
        strategy: 'session'
      },
      validate: {
        payload: validPayload
      }
    },
    handler: function (request, reply) {
      reqProj = request.payload.project;
      User = request.auth.credentials;

      // generate api key
      reqProj.apiKey = uuid.v4();

      User.createProject(reqProj).then(function (project) {
        reply({project: project}).created('/projects/' + project.id);    // HTTP 201
      }, function (err) {
        reply(Boom.badRequest(err)); // HTTP 400
      });

    }
  });
};


/**
 * GET /projects/{id}
 * Gets the experiment based upon the {id} parameter.
 *
 * @param server
 */
var show = function (server) {
  var User;

  server.route({
    method: 'GET',
    path: '/projects/{id}',
    config: {
      description: 'Gets the project based upon the {id} parameter.',
      auth: {
        mode: 'required',
        strategy: 'session'
      },
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      User = request.auth.credentials;

      User.getProjects({
        where: {
          id: request.params.id
        },
        limit: 1
      }).then(function (projects) {
        if (projects.length > 0) {
          reply({project: projects[0]});
        } else {
          reply(Boom.notFound());
        }
      }, function (err) {
        reply(Boom.badRequest(err));
      });
    }
  });
};


/**
 * PUT /projects/{id}
 * Creates a new experiment in the datastore.
 *
 * @param server - The Hapi Serve
 */
var update = function (server) {
  var reqProj, User;

  server.route({
    method: 'PUT',
    path: '/projects/{id}',
    config: {
      description: 'Update a single project based on PUT data',
      auth: {
        mode: 'required',
        strategy: 'session'
      },
      validate: {
        payload: validPayload
      }
    },
    handler: function (request, reply) {
      reqProj = request.payload.project;
      reqProj.id = Number(request.params.id);
      delete reqProj.updatedAt;
      delete reqProj.createdAt;
      delete reqProj.apiKey;

      User = request.auth.credentials;

      User.getProjects({
        where: {
          id: request.params.id
        },
        limit: 1
      }).then(function (projects) {
        if (projects.length > 0) {
          var project = projects[0];
          project.update(reqProj).then(function (newProj) {
            reply({project: newProj});  // HTTP 200
          }, function (err) {
            reply(Boom.badImplementation(err)); // 500 error
          });
        } else {
          reply(Boom.notFound());
        }
      }, function (err) {
        reply(Boom.badRequest(err));
      });
    }
  });
};

/**
 * DELETE /projects/{id}
 * Deletes a project, based on the project id in the path.
 *
 * @param server - The Hapi Server
 */
var remove = function (server) {
  var User;

  server.route({
    method: 'DELETE',
    path: '/projects/{id}',
    config: {
      description: 'Deletes a project, based on the project id in the path.',
      auth: {
        mode: 'required',
        strategy: 'session'
      },
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      User = request.auth.credentials;

      User.getProjects({
        where: {
          id: request.params.id
        },
        limit: 1
      }).then(function (projects) {
        if (projects.length > 0) {
          var project = projects[0];
          project.destroy().then(function (deleted) {
            if (deleted) {
              reply({message: 'Project deleted successfully'});
            } else {
              reply(Boom.badImplementation());
            }
          }, function (err) {
            reply(Boom.badImplementation(err));
          });
        } else {
          reply(Boom.notFound());
        }
      }, function (err) {
        reply(Boom.badRequest(err));
      });
    }
  });
};


module.exports = function (server) {
  index(server);
  create(server);
  show(server);
  update(server);
  remove(server);
};
