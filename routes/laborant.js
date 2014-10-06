/**
 * Created by pman on 05.10.14.
 */
var Joi = require('joi');
// Exports = exports? Huh? Read: http://stackoverflow.com/a/7142924/5210
module.exports = exports = function (server) {
  exports.jsonp(server);
};

exports.jsonp = function(server) {
  server.route({
    path: "/laborant",
    method: "GET",
    config: {
      handler: function(request, reply) {
        server.methods.ensureCorrectDomain(request, function(err, client) {
          // console.log(request.headers);
          if (err) {
            reply(Boom.badRequest("Incorrect apiKey"));
          } else {
            var callback = request.query.callback,
                text = callback + '(' + JSON.stringify({
                  status: 'success',
                  experiments: {
                    'green_button': 1,
                    'footer_text': 0
                  },
                  client: client
                }) + ')';

            reply(text);
          }
        })
      },
      validate: {
        query: {
          callback: Joi.string().required(),
          apiKey: Joi.string().required()
        }
      }
    }
  });
};