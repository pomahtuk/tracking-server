/*jslint node: true, es5: true, indent: 2, nomen: true*/

'use strict';

var Hapi        = require('hapi'),
  serverConfig  = require('./config/server'),
  Mongoose      = require('mongoose'),
  routes        = require('./routes'),
  methods       = require('./methods'),
  Scooter       = require('scooter'),
  Lout          = require('lout'),
  port          = process.env.PORT || 3000,
  server        = new Hapi.Server(serverConfig),
  mongoURI;

server.connection({ port: port });

mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/tracking_tool';

// MongoDB Connection
Mongoose.connect(mongoURI);
//Mongoose.set('debug', true);

server.views({
  engines: {
    jade: require('jade')
  },
  path: __dirname,
  isCached: false
});

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

routes.init(server);
methods.init(server);

if (!module.parent) {
  server.register([
    {
      register: Scooter,
      options: {} // options for Scooter
    },{
      register: Lout,
      options: {} // options for Lout
    }
  ], function(err) {
    server.start(function () {
      console.log('Server started and listeting on port ' + port );
    });
  });
}

module.exports = server;
