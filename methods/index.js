/*jslint node: true, es5: true, indent: 2*/

'use strict';

var geoip = require('geoip-lite'),
  ClientAccount = require('../models/clientAccount').ClientAccount,
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

  /**
   * Looks up for visitor with particular cookies in DB
   * and returns one, or creates new visitor determining all data
   * @param {Object}   request HAPI.Request object
   * @param {Function} next    Callback to return control over process to server method
   * return {Visitor} instance of visitor
   */
  server.method("getUserFromCookies", function (request, next) {
    console.log(request.state);
    var sessionId = request.state.laborantSession || '',
      visitorUaData = request.plugins.scooter,
      visitorBrowser = visitorUaData.family + ' ' + visitorUaData.major + '.' + visitorUaData.minor + '.' + visitorUaData.patch || 'unknown',
      visitorDevice = visitorUaData.device.family || 'unknown',
      visitorOs = visitorUaData.os.family + ' ' + visitorUaData.os.major + '.' + visitorUaData.os.minor + '.' + visitorUaData.os.patch || 'unknown',
      visitorCountry,
      newVisitor;

    function visitorCallback(err, visitor) {
      console.log(err);
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
      visitorCountry = geoip.lookup(request.info.remoteAddress);

      newVisitor = new Visitor({
        browser: visitorBrowser,
        device: visitorDevice,
        os: visitorOs,
        lang: request.headers['accept-language'].split(';')[0].split(',')[0],
        ip: request.info.remoteAddress,
        referrer: request.info.referrer,
        country: visitorCountry ? visitorCountry.country + ', ' + visitorCountry.region + ', ' + visitorCountry.city : 'unknown'
      });
      newVisitor.save(visitorCallback);
    }
  });

};
