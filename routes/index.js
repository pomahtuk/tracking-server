/*jslint node: true, es5: true, indent: 2*/

'use strict';

var fs        = require('fs');
var path      = require('path');
var Boom      = require('boom');
var Joi       = require('joi');
var UglifyJS  = require('uglify-js');
var Project   = require('../models').Project;
var Event     = require('../models').Event;

var trackingEventsCache = [];


var agendaSetup = function (agenda) {
  agenda.define('dump tracking cache to MySQL', function(job, done) {
    // this looks tricky
    // make a copy of current dataset
    // wipe original
    var dataToStore = trackingEventsCache.splice(0, trackingEventsCache.length - 1);

    if (dataToStore.length > 0) {
      Event.bulkCreate(dataToStore).then(function() {
        done();
      }, function (err) {
        // find a way to erport error
        console.log(err);
        // ad try again may be? later
        done();
      });
    } else {
      done();
    }
  });

  // define a job for processing events

  // set up repetetive job
  var job = agenda.create('dump tracking cache to MySQL');
  job.repeatEvery('60 seconds');
  job.save();

}

/**
 * Add your other routes below.
 * Each model might have a file that declares its
 * routes, such as the Events model.
 *
 * @param server
 */
exports.init = function (server, agenda) {
  require('./laborant')(server);
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

  // add route for injecting script
  // sync operations are possible bottlenecks,
  // but for right now we are fine
  server.route({
    method: 'GET',
    path: '/{apiKey}/laborant.js',
    config: {
      handler: function (request, reply) {
        var processedData = '',
          filePath = __dirname + '/../public/' + request.params.apiKey + '/laborant.js';

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
      validate: {
        query: {
          apiKey: Joi.string().required()
        }
      },
      handler: function (request, reply) {
        // we are going to collect some events for 1 minute
        // dump to database
        // clear cache
        // and repeat
        var expId = request.params.expId;
        var eventType = request.params.eventType;
        var visitorUaData = request.plugins.scooter;
        var visitorBrowser = visitorUaData.family + ' ' + visitorUaData.major + '.' + visitorUaData.minor + '.' + visitorUaData.patch || 'unknown';
        var visitorDevice = visitorUaData.device.family || 'unknown';
        var visitorOs = visitorUaData.os.family + ' ' + visitorUaData.os.major + '.' + visitorUaData.os.minor + '.' + visitorUaData.os.patch || 'unknown';
        // geoip should run in background!

        trackingEventsCache.push({
          type: eventType,
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

  // add intial route with all experiments for laborant
  // get md5 of UA string + ip + referrer to identify user
  // validate: {
  //   query: {
  //     apiKey: Joi.string().required(),
  //     experiments Joi.optional()
  //   }
  // },

};
