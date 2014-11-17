/*jslint node: true, es5: true, indent: 2*/

'use strict';

var ClientAccount = require('../models/clientAccount').ClientAccount; // Mongoose ODM

/**
 * Add your other methods below.
 *
 * @param server
 */
exports.init = function (server) {

  server.method("ensureCorrectDomain", function (request, next) {
    var apiKey = request.query.apiKey;
    if (apiKey && request.headers.host) {
      if (apiKey === 'laborant_development_key' || request.headers.host.indexOf('localhost') !== -1) {
        ClientAccount
          .findOne({'name': 'pman'})
          .populate('experiments')
          .exec(function (err, client) {
            if (err) {
              next(err, null);
            } else {
              next(null, client);
            }
          });
      } else {
        ClientAccount
          .findOne(apiKey)
          .populate('experiments')
          .exec(function (err, client) {
            if (err) {
              next(err, null);
            // this check should be far more complicated
            } else if (client && client.domain === request.headers.host) {
              next(null, client);
            } else {
              next(new Error('No client found for this API key'), null);
            }
          });
      }
    } else {
      next(new Error('no query params or wrong headers'), null);
    }
  });

  server.method("getUserFromCookies", function (request, next) {
    console.log(request.state);
    // if present - request a visitor with sessionId from cookie
    // if not - create new visitor
    next(null, 'placeholder');
  });

};
