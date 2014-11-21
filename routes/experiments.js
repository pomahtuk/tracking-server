/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var Boom          = require('boom'),                                  // HTTP Errors
  Joi             = require('joi'),                                   // Validation
  Experiment      = require('../models/experiment').Experiment, // Mongoose ODM
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
    for (prop in err.errors) {
      if (err.errors.hasOwnProperty(prop)) {
        errorMessage += err.errors[prop].message + ' ';
      }
    }

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
          reply(experiments);
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
  var experiment;

  server.route({
    method: 'POST',
    path: '/experiments',
    handler: function (request, reply) {

      experiment = new Experiment();
      // real data!
      experiment.category = request.payload.category;
      experiment.action = request.payload.action;
      experiment.label = request.payload.label;
      experiment.source = request.info.remoteAddress;

      experiment.save(function (err) {
        if (!err) {
          reply(experiment).created('/experiments/' + experiment._id);    // HTTP 201
        } else {
          reply(Boom.forbidden(getErrorMessageFrom(err))); // HTTP 403
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
          reply(experiment);
        } else if (err) {
          // Log it, but don't show the user, don't want to expose ourselves (think security)
          console.log(err);
          reply(Boom.notFound());
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
    handler: function (request, reply) {
      Experiment.findById(request.params.id, function (err, experiment) {
        if (!err && experiment) {
          experiment.remove();
          reply({ message: "Experiment deleted successfully"});
        } else if (!err) {
          // Couldn't find the object.
          reply(Boom.notFound());
        } else {
          console.log(err);
          reply(Boom.badRequest("Could not delete Experiment"));
        }
      });
    },
    config: {
      validate: {
        params: {
          id: Joi.string().alphanum().min(5).required()
        }
      }
    }
  });
};
