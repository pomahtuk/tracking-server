/*jslint node: true, indent: 2, nomen: true*/

'use strict';

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

var Hapi          = require('hapi');
var Agenda        = require('agenda');
var serverConfig  = require('./config/server');
var models        = require('./models');
var routes        = require('./routes');
var methods       = require('./methods');
var env           = process.env.NODE_ENV || 'development';
var port          = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server        = new Hapi.Server(serverConfig);
var mongoURI      = process.env.OPENSHIFT_MONGODB_DB_URL ? process.env.OPENSHIFT_MONGODB_DB_URL + 'laborant' : process.env.MONGOLAB_URI || 'mongodb://localhost/tracking_tool';
var agenda        = new Agenda({
  db: {
    address: mongoURI,
    collection: 'agendaJobs'
  }
});
var connectionParams = {
  port: port
};

if (process.env.OPENSHIFT_NODEJS_IP) {
  connectionParams.host = process.env.OPENSHIFT_NODEJS_IP ;
}

server.connection(connectionParams);

// Lout Options
// 'engines' - an object where each key is a file extension (e.g. 'html', 'jade'), mapped to the npm module name (string) used for rendering the templates. Default is { html: 'handlebars' }.
// 'endpoint' - the path where the route will be registered. Default is /docs.
// 'basePath' - the absolute path to the templates folder. Default is the lout templates folder.
// 'cssPath' - the absolute path to the css folder. Default is the lout css folder. It must contain a style.css.
// 'helpersPath' - the absolute path to the helpers folder. Default is the lout helpers folder. This might need to be null if you change the basePath.
// 'partialsPath' - the absolute path to the partials folder. Default is the lout templates folder. This might need to be null if you change the basePath.
// 'auth' - the route configuration for authentication. Default is to disable auth.
// 'indexTemplate' - the name of the template file to contain docs main page. Default is 'index'.
// 'routeTemplate' - the name of the route template file. Default is 'route'.
// 'filterRoutes' - a function that receives a route object containing method and path and returns a boolean value to exclude routes.

var packagesToRegister = [{
    register: require('scooter'),
    options: {} // options for Scooter
  }, {
    register: require('lout'),
    options: {} // options for Lout
  }, {
    register: require('hapi-auth-cookie'),
    options: {}
  }];

if (env === 'development') {
  packagesToRegister.push({
    register: require('good'),
    options: {
      reporters: [{
        reporter: require('good-console'),
        events: {
            request: '*',
            log: '*'
        },
        args: [{ response: '*' }]
      }]
    }
  });
}

models.sequelize.sync().then(function () {
  server.register(packagesToRegister, function (err) {
    if (err) {
      throw err;
    }

    server.auth.strategy('session', 'cookie', {
      password: 'T7XxT3nnkX',
      ttl: 14 * 24 * 60 * 60 * 1000, // 14 days
      clearInvalid: true,
      redirectOnTry: false,
      cookie: 'sid',
      // mode: 'false', // for a while, untill correct auth are not implemented
      isSecure: false,
      validateFunc: require('./helpers/sessionValidate.js')
    });

    routes.init(server, agenda);
    methods.init(server);

    // cookie storage fot experiments
    server.state('exps', {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      isHttpOnly: false,
      encoding: 'base64json',
      clearInvalid: true,
      strictHeader: true // don't allow violations of RFC 6265
    });

    // cookie storage for visitor id part
    server.state('_lvid', {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
      isHttpOnly: false,
      encoding: 'base64json',
      clearInvalid: true,
      strictHeader: true // don't allow violations of RFC 6265
    });

    if(!module.parent) {
      // do not start agenda for tests...
      agenda.start();
      server.start(function () {
        console.log('Server started and listeting on port ' + port);
      });
    }

  });
});

process.stdin.resume();

function graceful() {
  agenda.stop(function() {
    process.exit(0);
  });
}

process.on('SIGTERM', graceful);
process.on('SIGINT' , graceful);
process.on('exit', graceful);

module.exports = server;
