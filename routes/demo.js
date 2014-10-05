var Joi = require('joi');                                   // Validation

// Exports = exports? Huh? Read: http://stackoverflow.com/a/7142924/5210
module.exports = exports = function (server) {
  exports.hello(server);
  exports.staticFiles(server);
};

exports.hello = function(server) {

  var helloConfig = {
    handler: function(request, reply) {
      var names = request.params.name.split("/");
      server.methods.getColour(request.params.name, function(err, colour) {
        reply.view('hello', {
          first: names[0],
          last: names[1],
          mood: request.query.mood,
          age: request.query.age,
          colour: colour
        });
      });
    },
    validate: {
      params: {
        name: Joi.string().min(8).max(100)
      },
      query: {
        mood: Joi.string().valid(["neutral","happy","sad"]).default("neutral"),
        age: Joi.number().integer().min(13).max(100).default(20)
      }
    }
  };

  server.route({
    path: "/{name*2}",
    method: "GET",
    config: helloConfig
  });
};

exports.staticFiles = function(server) {
  server.route({
    path: "/static/{path*}",
    method: "GET",
    handler: {
      directory: {
        path: "./public",
        listing: false,
        index: false
      }
    }
  });
};