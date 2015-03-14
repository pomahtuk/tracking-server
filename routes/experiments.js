/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var Boom          = require('boom'),                                  // HTTP Errors
  Joi             = require('joi'),                                   // Validation
  Experiment      = require('../models/experiment').Experiment,       // Mongoose ODM
  _               = require('lodash'),
  exports = function (server) {
    exports.index(server);
    exports.create(server);
    exports.show(server);
    exports.remove(server);
  };

module.exports = exports;

/**
 * Formats an error message that is returned from Mongoose.
 *
 * @param err The error object
 * @returns {string} The error message string.
 */
function getErrorMessageFrom(err) {
  var errorMessage = '', prop;

  if (err.errors) {
    // for (prop in err.errors) {
    //   if (err.errors.hasOwnProperty(prop)) {
    //     errorMessage += err.errors[prop].message + ' ';
    //   }
    // }

    errorMessage = JSON.stringify(err.errors);

  } else {
    errorMessage = err.message;
  }

  return errorMessage;
}

/**
 * GET /experiments
 * Gets all the experiments from MongoDb and returns them.
 * TODO: add pagination
 *
 * @param server - The Hapi Server
 */
exports.index = function (server) {
  // GET /experiments
  server.route({
    method: 'GET',
    path: '/experiments',
    handler: function (request, reply) {
      Experiment.find({}, function (err, experiments) {
        if (!err) {
          reply({
            experiments: experiments
          });
        } else {
          reply(Boom.badImplementation(err)); // 500 error
        }
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
exports.create = function (server) {
  // POST /experiments
  var experiment, reqExp;

  server.route({
    method: 'POST',
    path: '/experiments',
    config: {
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
      experiment = new Experiment();

      // real data!
      _.assign(experiment, reqExp);
      // some validation may be?

      experiment.save(function (err) {
        if (!err) {
          reply({experiment: experiment}).created('/experiments/' + experiment._id);    // HTTP 201
        } else {
          reply(Boom.badRequest(getErrorMessageFrom(err))); // HTTP 400
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
exports.show = function (server) {

  server.route({
    method: 'GET',
    path: '/experiments/{id}',
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().min(5).required()
        }
      }
    },
    handler: function (request, reply) {
      Experiment.findById(request.params.id, function (err, experiment) {
        if (!err && experiment) {
          reply({experiment: experiment});
        } else if (err) {
          // Log it, but don't show the user, don't want to expose ourselves (think security)
          console.log(err);
          reply(Boom.badRequest());
        } else {
          reply(Boom.notFound());
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
exports.remove = function (server) {
  server.route({
    method: 'DELETE',
    path: '/experiments/{id}',
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().min(5).required()
        }
      }
    },
    handler: function (request, reply) {
      Experiment.findById(request.params.id, function (err, experiment) {
        if (!err && experiment) {
          experiment.remove();
          reply({ message: "Experiment deleted successfully"});
        } else if (!err) {
          // Couldn't find the object.
          reply(Boom.notFound()); //404
        } else {
          console.log(err);
          reply(Boom.badRequest("Could not delete Experiment"));
        }
      });
    }
  });
};
