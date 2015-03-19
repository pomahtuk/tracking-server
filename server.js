/*jslint node: true, es5: true, indent: 2, nomen: true*/

'use strict';

var Hapi          = require('hapi');
var serverConfig  = require('./config/server');
var Mongoose      = require('mongoose');
var models        = require("./models");
var routes        = require('./routes');
var methods       = require('./methods');
var port          = process.env.PORT || 3000;
var server        = new Hapi.Server(serverConfig);
var mongoURI      = process.env.MONGOLAB_URI || 'mongodb://localhost/tracking_tool';

server.connection({ port: port });

// MongoDB Connection
// Mongoose.connect(mongoURI);
// Mongoose.set('debug', true);

// Or you can simply use a connection uri
// var sequelizeConnection = new Sequelize('postgres://user:pass@example.com:5432/dbname');

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

models.sequelize.sync().then(function () {
  server.register([
    {
    //   register: require('good'),
    //   options: {
    //    reporters: [{
    //       reporter: require('good-console'),
    //       args:[{ response: '*' }]
    //     }]
    //   }
    // }, {
      register: require('scooter'),
      options: {} // options for Scooter
    },{
      register: require('lout'),
      options: {} // options for Lout
    // }, {
    //   register: require('bell'), // bell options
    //   options: {}
    }, {
      register: require('hapi-auth-cookie'),
      options: {}
    }
  ], function(err) {
    server.auth.strategy('session', 'cookie', {
      password: 'T7XxT3nnkX',
      ttl: 14 * 24 * 60 * 60 * 1000, // 14 days
      clearInvalid: true,
      redirectOnTry: false,
      cookie: 'sid',
      mode: 'required', // for a while, untill correct auth are not implemented
      isSecure: false,
      validateFunc: require('./helpers/sessionValidate.js')
    });

    server.auth.default({
      mode: 'required',
      strategy: 'session'
    });

    routes.init(server);
    methods.init(server);

    server.start(function () {
      console.log('Server started and listeting on port ' + port );
    });

  });
});

module.exports = server;
