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
    var apiKey = request.query.apiKey;
    if (apiKey && request.headers.host) {
      if (apiKey === 'laborant_development_key' || request.headers.host.indexOf('localhost') !== -1 ) {
        ClientAccount
          .findOne({name: 'pman'})
          .populate('experiments')
          .exec(function(err, client) {
            if (err) {
              next(err, null);
            } else {
              next(null, client);
            }
          })
      } else {
        ClientAccount
          .findOne(apiKey)
          .populate('experiments')
          .exec(function (err, client) {
            if (err) {
              next(err, null);
            // this check should be far more complicated
            } else if (clinet && client.domain === request.headers.host) {
              next(null, client);
            } else {
              next(new Error('No client found for this API key'), null);
            }
          })
      }
    } else {
      next(new Error('no query params or wrong headers'), null);
    }
  });

};
