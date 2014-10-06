var ClientAccount = require('../models/clientAccount').ClientAccount; // Mongoose ODM

/**
 * Add your other methods below.
 *
 * @param server
 */
exports.init = function(server) {

  server.method("getColour", function(name, next) {
    var colours = ["red", "blue", "indigo", "violet", "green"];
    var colour = colours[Math.floor(Math.random() * colours.length)];
    next(null, colour);
  }, {
    cache: {
      expiresIn: 30000
    }
  });

  server.method("ensureCorrectDomain", function(request, next) {
    var apiKey;
    if (request.query) {
      apiKey = request.query.apiKey;
      if (apiKey === 'laborant_development_key') {
        ClientAccount.findOne({}, {}, { sort: { 'dateCreated' : -1 } }, function(err, client) {
          if (err) {
            next(err, null);
          } else {
            next(null, client);
          }
        })
      } else {
        ClientAccount.findOne(apiKey, function (err, client) {
          if (err) {
            next(err, null);
          } else if (clinet && client._id) {
            next(null, client);
          } else {
            next(new Error('No client found for this API key'), null);
          }
        })
      }
    } else {
      next(new Error('no query params'), null);
    }
  });

};
