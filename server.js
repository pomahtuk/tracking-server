/*jslint node: true, es5: true, indent: 2, nomen: true*/

'use strict';

var Hapi        = require('hapi'),
  serverConfig  = require('./config/server'),
  Mongoose      = require('mongoose'),
  routes        = require('./routes'),
  methods       = require('./methods'),
  Scooter       = require('scooter'),
  server        = new Hapi.Server(process.env.PORT || 3000, serverConfig),
  mongoURI;

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

routes.init(server);
methods.init(server);

server.pack.register({ plugin: Scooter }, function (err) {
  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});
