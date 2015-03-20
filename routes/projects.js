/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var Boom            = require('boom');                                  // HTTP Errors
var Joi             = require('joi');                                   // Validation
var sqlProject      = require('../models').Project;                  // Sequilize ORM


/**
 * GET /projects
 * Gets all the projects from DB and returns them.
 * TODO: add pagination
 *
 * @param server - The Hapi Server
 */
var index = function (server) {
  // GET /projects
  server.route({
    method: 'GET',
    path: '/projects',
    config: {
      description: "Gets all the projects from DB and returns them."
    },
    handler: function (request, reply) {
      sqlProject.findAll().then(function (projects) {
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
  var reqProj;

  server.route({
    method: 'POST',
    path: '/projects',
    config: {
      description: "Creating a single project based on POST data",
      validate: {
        payload: {
          project: Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            description: Joi.string().min(3).max(3000).required(),
            domain: Joi.string().min(3).max(100).required()
          })
        }
      }
    },
    handler: function (request, reply) {
      reqProj = request.payload.project;

      sqlProject.create(reqProj).then(function (project) {
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

  server.route({
    method: 'GET',
    path: '/projects/{id}',
    config: {
      description: "Gets the project based upon the {id} parameter.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      sqlProject.findOne(request.params.id).then(function (project) {
        reply({project: project});
      }, function (err) {
        // Log it, but don't show the user, don't want to expose ourselves (think security)
        console.log(err);
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
  server.route({
    method: 'DELETE',
    path: '/projects/{id}',
    config: {
      description: "Deletes a project, based on the project id in the path.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      sqlProject.destroy({
        where: {
          id: request.params.id
        },
        limit: 1
      }).then(function (deleted) {
        if (deleted) {
          reply({ message: "Project deleted successfully"});
        } else {
          reply(Boom.notFound("Could not delete project"));
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
  remove(server);
};
