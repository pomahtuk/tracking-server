/*jslint node: true, indent: 2*/

'use strict';

var fs            = require('fs');
var crypto        = require('crypto');
var Boom          = require('boom');
var Joi           = require('joi');
var Project       = require('../models').Project;
var Experiment    = require('../models').Experiment;
var sqlEvent      = require('../models').Event;
var fileUtilities = require('../helpers/fileGeneration.js');

var trackingEventsCache = [];

var wrapJsonp = function (callbackName, data) {
  return callbackName + '(' + JSON.stringify(data) + ');';
};

var agendaSetup = function (agenda) {
  // define a job for dumping events to DB
  /*jslint unparam: true*/
  agenda.define('dump tracking cache to MySQL', function (job, done) {
    // this looks tricky
    // make a copy of current dataset
    // wipe original
    var dataToStore = trackingEventsCache.splice(0, trackingEventsCache.length - 1);

    if (dataToStore.length > 0) {
      sqlEvent.bulkCreate(dataToStore).then(function () {
        done();
      }, function (err) {
        // find a way to erport error
        console.log(err);
        // ad try again may be? later
        done(err);
      });
    } else {
      done();
    }
  });
  /*jslint unparam: false*/

  agenda.every('60 seconds', 'dump tracking cache to MySQL');


  // define a job for processing events
  /*jslint unparam: true*/
  agenda.define('process collected events', function (job, done) {
    // get everything from sql
    sqlEvent.findAll({
      where: {
        timestamp: {
          $lte: new Date()
        }
      }
    }).then(function (rawEvents) {
      if (rawEvents) {
        console.log('Events retreived: ', rawEvents.length);
        // for
        done();
      } else {
        done();
      }
    }, function (err) {
      console.log(err);
      done(err);
    });
  });
  /*jslint unparam: false*/

  agenda.every('5 minutes', 'process collected events');

};

/**
 * Add your other routes below.
 * Each model might have a file that declares its
 * routes, such as the Events model.
 *
 * @param server
 */
exports.init = function (server, agenda) {
  require('./experiments')(server);
  require('./projects')(server);
  require('./goals')(server);
  require('./auth')(server);

  agendaSetup(agenda);

  // check for ua string
  server.route({
    method: 'GET',
    path: '/user-agent',
    config: {
      handler: function (request, reply) {
        return reply(request.plugins.scooter.toJSON());
      }
    }
  });

  // haproxy route helper
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {
        return reply('server running', request.params);
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
      handler: function (request, reply) {
        var filePath = __dirname + '/../public/' + request.params.apiKey + '/laborant.js';
        var templatePath = __dirname + '/../public/laborant.template.js';
        var apiKey = request.params.apiKey;

        // check if project with api key present
        // and check for modifications of template!
        Project.find({
          where: {
            apiKey: request.params.apiKey
          }
        }).then(function (project) {
          if (project) {
            // try to serve pre-saved file
            // BOTTLENECK!
            if (fs.existsSync(filePath)) {
              fileUtilities.checkModification(apiKey, filePath, templatePath, function (err, resultFilePath) {
                if (err) {
                  return reply(Boom.badImplementation(err));
                }
                return reply.file(resultFilePath).header('Content-Type', 'application/javascript');
              });
            } else {
              // if file doesn't exist
              fileUtilities.generateScript(apiKey, filePath, templatePath, function (err, newFilePath) {
                if (err) {
                  return reply(Boom.badImplementation(err));
                }
                return reply.file(newFilePath).header('Content-Type', 'application/javascript');
              });
            }
          } else {
            return reply(Boom.notFound());
          }
        }, function (err) {
          return reply(Boom.badImplementation(err));
        });
      }
    }
  });

  // add route to write all statistics
  // return gathered user info
  server.route({
    method: 'GET',
    path: '/laborant/{eventType}/{expId}',
    config: {
      validate: {
        query: {
          apiKey: Joi.string().required()
        }
      },
      handler: function (request, reply) {
        // generate visitorIdentity here

        // if expId provided, could be not
        // TODO: notexpId, but eventId
        var expId = request.params.expId;
        // to identify project for event
        var apiKey = request.query.apiKey;
        var eventType = request.params.eventType;
        var visitorUaData = request.plugins.scooter;
        var visitorBrowser = visitorUaData.family + ' ' + visitorUaData.major + '.' + visitorUaData.minor + '.' + visitorUaData.patch || 'unknown';
        var visitorDevice = visitorUaData.device.family || 'unknown';
        var visitorOs = visitorUaData.os.family + ' ' + visitorUaData.os.major + '.' + visitorUaData.os.minor + '.' + visitorUaData.os.patch || 'unknown';
        var expVariant = request.params.variant;

        // assuming that this parameters let us identify visitor
        // BOTTLENECK! coud be, md5 is syncronus and UA string could be sent enormously big
        var visiorIdentity = crypto.createHash('md5').update(visitorUaData.toString() + request.info.referrer + request.info.remoteAddress).digest('hex');
        // geoip should run in background!

        trackingEventsCache.push({
          visiorIdentity: visiorIdentity,
          type: eventType,
          expId: expId,
          expVariant: expVariant,
          apiKey: apiKey,
          browser: visitorBrowser,
          device: visitorDevice,
          os: visitorOs,
          lang: request.headers['accept-language'].split(';')[0].split(',')[0],
          ip: request.info.remoteAddress,
          referrer: request.info.referrer,
          timestamp: new Date()
        });

        reply('');
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/laborant',
    config: {
      validate: {
        query: {
          apiKey: Joi.string().required(),
          callback: Joi.string().required(), // request.query.callback;
          experiments: Joi.optional()
        }
      },
      handler: function (request, reply) {
        // reply all initial exps
        // also we could just write a server-side cookie with encoded experiments,
        // assigned to user. Decoding should be extreemly simple
        var callbackName = request.query.callback;

        Project.findOne({
          where: {
            apiKey: request.query.apiKey
          },
          include: [ Experiment ]
        }).then(function (project) {

          if (!project) {
            return reply(Boom.notFound());
          }

          var clientExps = request.state.exps;
          var experimentsList = {};

          project.Experiments.forEach(function (experiment) {
            if (clientExps && clientExps.hasOwnProperty && clientExps.hasOwnProperty(experiment.tag)) {
              experimentsList[experiment.tag] = clientExps[experiment.tag];
            } else {
              experimentsList[experiment.tag] = Math.floor(Math.random() * (experiment.variantCount));
            }
          });

          var response = wrapJsonp(callbackName, {
            status: 'success',
            experiments: experimentsList
          });

          reply(response).header('Content-Type', 'application/javascript').state('exps', experimentsList);
        }, function (err) {
          reply(Boom.badImplementation(err));
        });
      }
    }
  });

};
