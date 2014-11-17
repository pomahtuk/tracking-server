/*jslint node: true, es5: true, indent: 2*/

'use strict';

var Hapi        = require('hapi'),
  serverConfig  = require('./config/server'),
  Mongoose      = require('mongoose'),
  routes        = require('./routes'),
  methods       = require('./methods'),
  server        = new Hapi.Server(process.env.PORT || 3000, serverConfig),
  mongoURI;

mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/tracking_tool';

// MongoDB Connection
Mongoose.connect(mongoURI);
//Mongoose.set('debug', true);

routes.init(server);
methods.init(server);

server.start(function () {
  server.log('info', 'Server running at: ' + server.info.uri);
});
