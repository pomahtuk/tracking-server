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
  // GET /experiments
  server.route({
    method: 'GET',
    path: '/experiments',
    config: {
      description: "Gets all the experiments from MongoDb and returns them."
    },
    handler: function (request, reply) {
      sqlExperiment.findAll().then(function (experiments) {
        reply({
          experiments: experiments
        });
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
  var reqExp;

  server.route({
    method: 'POST',
    path: '/experiments',
    config: {
      description: "Creating a single experiment based on POST data",
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

      sqlExperiment.create(reqExp).then(function(experiment) {
        reply({experiment: experiment}).created('/experiments/' + experiment.id);    // HTTP 201
      }, function (err) {
        reply(Boom.badRequest(err)); // HTTP 400
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
    path: '/experiments/{id}',
    config: {
      description: "Gets the experiment based upon the {id} parameter.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      sqlExperiment.findOne(request.params.id).then(function (experiment) {
        reply({experiment: experiment});
      }, function(err) {
        // Log it, but don't show the user, don't want to expose ourselves (think security)
        console.log(err);
        reply(Boom.badRequest(err));
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
    path: '/experiments/{id}',
    config: {
      description: "Deletes an experiment, based on the experiment id in the path.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      sqlExperiment.destroy({
        where: {
          id: request.params.id
        },
        limit: 1
      }).then(function (deleted) {
        if (deleted) {
          reply({ message: "Experiment deleted successfully"});
        } else {
          reply(Boom.notFound("Could not delete Experiment"));
        }
      }, function (err) {
        reply(Boom.badRequest(err));
      })
    }
  });
};


module.exports = exports = function (server) {
  index(server);
  create(server);
  show(server);
  remove(server);
};
