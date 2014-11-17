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

exports.jsonp = function (server) {
  server.route({
    path: "/laborant",
    method: "GET",
    config: {
      handler: function (request, reply) {
        server.methods.ensureCorrectDomain(request, function (err, client) {
          // console.log(request.headers);
          if (err) {
            reply(Boom.badRequest("Incorrect apiKey"));
          } else {
            var callbackName = request.query.callback,
              text = wrapJsonp(callbackName, {
                status: 'success',
                experiments: {
                  'green_button': 1,
                  'footer_text': 0
                },
                client: client,
                // headers: request.headers,
                data: request.query.experiments
              });

            reply(text).header('Content-Type: application/json; charset=utf-8');
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
