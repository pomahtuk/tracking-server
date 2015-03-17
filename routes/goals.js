/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var Boom     = require('boom');                            // HTTP Errors
var Joi      = require('joi');                             // Validation
var sqlGoal  = require('../models').Goal;                  // Sequilize ORM


/**
 * GET /goals
 * Gets all the goals from MongoDb and returns them.
 * TODO: add pagination
 *
 * @param server - The Hapi Server
 */
var index = function (server) {
  // GET /goals
  server.route({
    method: 'GET',
    path: '/goals',
    config: {
      description: "Gets all the goals from MongoDb and returns them."
    },
    handler: function (request, reply) {
      sqlGoal.findAll().then(function (goals) {
        reply({
          goals: goals
        });
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
  var reqGoal;

  server.route({
    method: 'POST',
    path: '/goals',
    config: {
      description: "Creating a single goal based on POST data",
      validate: {
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

      sqlGoal.create(reqGoal).then(function(goal) {
        reply({goal: goal}).created('/goals/' + goal.id);    // HTTP 201
      }, function (err) {
        reply(Boom.badRequest(err)); // HTTP 400
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
    path: '/goals/{id}',
    config: {
      description: "Gets the goal based upon the {id} parameter.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      sqlGoal.findOne(request.params.id).then(function (goal) {
        reply({goal: goal});
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
    path: '/goals/{id}',
    config: {
      description: "Deletes a goal, based on the goal id in the path.",
      validate: {
        params: {
          id: Joi.number().integer().min(0).required()
        }
      }
    },
    handler: function (request, reply) {
      sqlGoal.destroy({
        where: {
          id: request.params.id
        },
        limit: 1
      }).then(function (deleted) {
        if (deleted) {
          reply({ message: "Goal deleted successfully"});
        } else {
          reply(Boom.notFound("Could not delete Goal"));
        }
      }, function (err) {
        reply(Boom.badRequest(err));
      })
    }
  });
};


module.exports = function (server) {
  index(server);
  create(server);
  show(server);
  remove(server);
};
