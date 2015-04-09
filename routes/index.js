/*jslint node: true, es5: true, indent: 2*/

'use strict';

var fs        = require('fs');
var path      = require('path');
var Boom      = require('boom');
var Joi       = require('joi');
var UglifyJS  = require('uglify-js');
var Project   = require('../models').Project;

/**
 * Add your other routes below.
 * Each model might have a file that declares its
 * routes, such as the Events model.
 *
 * @param server
 */
exports.init = function (server) {
  require('./laborant')(server);
  require('./events')(server);
  require('./experiments')(server);
  require('./projects')(server);
  require('./goals')(server);
  require('./auth')(server);

  // check for ua string
  server.route({
    method: 'GET',
    path: '/user-agent',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      handler: function (request, reply) {
        return reply(request.plugins.scooter.toJSON());
      }
    }
  });

  // add route for injecting script
  // sync operations are possible bottlenecks,
  // but for right now we are fine
  server.route({
    method: 'GET',
    path: '/{apiKey}/laborant.js',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      handler: function (request, reply) {
        var processedData = '',
          filePath = __dirname + '/../public/' + request.params.apiKey + '/laborant.js';

        // check if project with api key present
        Project.find({
          where: {
            apiKey: request.params.apiKey
          }
        }).then(function (projects) {
          if (projects.length > 0) {
            // try to serve pre-saved file
            // BOTTLENECK!
            if (fs.existsSync(filePath)) {
              reply.file(filePath).header('Content-Type', 'application/javascript');
            } else {
              // if file doesn't exist
              fs.readFile(__dirname + '/../public/laborant.template.js', {encoding: 'utf-8'}, function (err, data) {
                if (err) {
                  reply(Boom.notFound(err));
                } else {
                  // generate dev version with hardcoded project apiKey
                  processedData = String(data).replace(/%%apiKey%%/g, request.params.apiKey);
                  // uglify/minify
                  // BOTTLENECK!
                  processedData = UglifyJS.minify(processedData, {fromString: true});
                  processedData = processedData.code;
                  // if folder allready exists we are fine, but error will be thrown
                  try {
                    // BOTTLENECK!
                    fs.mkdirSync(__dirname + '/../public/' + request.params.apiKey)
                  } catch (err) {
                    console.log(err);
                    if (err.code !== 'EEXIST') {
                      return reply(Boom.badImplementation(err))
                    }
                  }
                  // save && serve
                  fs.writeFile(filePath, processedData, function (err) {
                    if (err) {
                      reply(Boom.badImplementation(err));
                    } else {
                      reply.file(filePath).header('Content-Type', 'application/javascript');
                    }
                  });
                }
              });
            }
          } else {
            reply(Boom.notFound());
          }
        }, function (err) {
          reply(Boom.badImplementation(err));
        })
      }
    }
  });

  // add route to write all statistics
  // return gathered user info
  server.route({
    method: 'GET',
    path: '/laborant/{eventType}/{expId}',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      validate: {
        query: {
          apiKey: Joi.string().required()
        }
      },
      handler: function (request, reply) {

        // make apiKey check
        // if all ok - save event

        reply(request.params.eventType + ', ' + request.params.expId + ', apiKey: ' + request.query.apiKey);
      }
    }
  });

  // add intial route with all experiments for laborant
  // validate: {
  //   query: {
  //     apiKey: Joi.string().required(),
  //     experiments Joi.optional()
  //   }
  // },

  // return gathered user info
  server.route({
    method: 'GET',
    path: '/user-info',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session'
      },
      handler: function (request, reply) {
        server.methods.getUserFromCookies(request, function (err, user) {
          return reply(user);
        });
      }
    }
  });


};
