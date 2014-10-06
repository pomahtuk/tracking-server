var Hapi        = require('hapi'),
  Good          = require('good'),
  serverConfig  = require('./config/server'),
  Mongoose      = require('mongoose'),
  routes 	      = require('./routes'),
  methods 	    = require('./methods'),
  server        = new Hapi.Server(process.env.PORT || 3000, serverConfig),
  mongoURI;

  mongoURI = process.env.MONGOLAB_URI ? process.env.MONGOLAB_URI : 'mongodb://localhost/tracking_tool';

// MongoDB Connection
Mongoose.connect(mongoURI);
Mongoose.set('debug', true);

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