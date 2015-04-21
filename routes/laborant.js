/*jslint node: true, es5: true, indent: 2*/

'use strict';

/**
 * Created by pman on 05.10.14.
 */
var Joi = require('joi'),
  Boom  = require('boom'),
  exports = function (server) {
    exports.jsonp(server);
  };

module.exports = exports;

function wrapJsonp(callbackName, data) {
  return callbackName + '(' + JSON.stringify(data) + ')';
}

/**
 * GET /laborant
 * Gets all running experiments and their variants,
 * returns JSONP response
 *
 * @param server - The Hapi Server
 */
exports.jsonp = function (server) {
  var callbackName;

  server.route({
    path: "/laborant-old/",
    method: "GET",
    config: {
      handler: function (request, reply) {
        server.methods.ensureCorrectDomain(request, function (err, client) {
          // console.log(request.headers);
          if (err) {
            reply(Boom.badRequest("Incorrect apiKey"));
          } else {
            server.methods.getUserFromCookies(request, function (err, user) {
              if (err) {
                reply(Boom.badRequest("Error getting user"));
              } else {
                callbackName = request.query.callback;
                // TODO: roll a dice for each user experiment stated!
                var text = wrapJsonp(callbackName, {
                  status: 'success',
                  experiments: {
                    'green_button': 1,
                    'footer_text': 0
                  },
                  client: client,
                  cookies: request.state,
                  data: request.query.experiments
                });

                reply(text).type('application/json;');
              }
            });
          }
        });
      },
      validate: {
        query: {
          callback: Joi.string().required(),
          apiKey: Joi.string().required()
        }
      }
    }
  });
};
