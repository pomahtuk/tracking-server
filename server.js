var Hapi        = require('hapi'),
  Good          = require('good'),
  serverConfig  = require('./config/server'),
  Mongoose      = require('mongoose'),
  routes 	      = require('./routes'),
  methods 	    = require('./methods'),
  server        = new Hapi.Server(3000, 'localhost', serverConfig);

// MongoDB Connection
Mongoose.connect('mongodb://localhost/tracking_tool');

routes.init(server);
methods.init(server);

server.pack.register(Good, function (err) {
  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});