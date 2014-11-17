/*jslint node: true, es5: true, indent: 2*/

'use strict';

var ClientAccount = require('../models/clientAccount').ClientAccount,
  Visitor = require('../models/visitor').Visitor; // Mongoose ODM

/**
 * Add your other methods below.
 *
 * @param server
 */
exports.init = function (server) {

  server.method("ensureCorrectDomain", function (request, next) {
    var apiKey = request.query.apiKey;

    function clientTestCallback(err, client) {
      if (err) {
        next(err, null);
      } else {
        next(null, client);
      }
    }

    function clientCallback(err, client) {
      if (err) {
        next(err, null);
      // this check should be far more complicated
      } else if (client && client.domain === request.headers.host) {
        next(null, client);
      } else {
        next(new Error('No client found for this API key'), null);
      }
    }

    if (apiKey && request.headers.host) {
      if (apiKey === 'laborant_development_key' || request.headers.host.indexOf('localhost') !== -1) {
        ClientAccount
          .findOne({'name': 'pman'})
          .populate('experiments')
          .exec(clientTestCallback);
      } else {
        ClientAccount
          .findOne(apiKey)
          .populate('experiments')
          .exec(clientCallback);
      }
    } else {
      next(new Error('no query params or wrong headers'), null);
    }
  });

  server.method("getUserFromCookies", function (request, next) {
    console.log(request.state);
    var sessionId = request.state.laborantSession,
      newVisitor;

    function visitorCallback(err, visitor) {
      if (err) {
        next(err, null);
      } else {
        next(null, visitor);
      }
    }

    if (sessionId) {
      // if present - request a visitor with sessionId from cookie
      Visitor.findOne(sessionId).exec(visitorCallback);
    } else {
      // if not - create new visitor
      // TODO: gather all visitor info!
      newVisitor = new Visitor({
        sessionKey: 'key',
        browser: 'browser',
        lang: 'lang',
        ip: 'ip',
        referrer: 'referrer',
        country: 'country'
      });
      newVisitor.save(visitorCallback);
    }
  });

};
