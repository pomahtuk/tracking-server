/*jslint node: true, indent: 2*/

'use strict';

var geoip = require('geoip-native');
var Visitor = require('../models/visitor').Visitor; // Mongoose ODM

// external helpers
var experiments = require('./experiments.js');
var goals = require('./goals.js');

/**
 * Add your other methods below.
 *
 * @param server
 */
exports.init = function (server) {

  // init methods from other files
  experiments(server);
  goals(server);

  /**
   * Looks up for visitor with particular cookies in DB
   * and returns one, or creates new visitor determining all data
   * @param {Object}   request HAPI.Request object
   * @param {Function} next    Callback to return control over process to server method
   * return {Visitor} instance of visitor
   */
  server.method('getUserFromCookies', function (request, next) {
    // console.log(request.state);
    var sessionId = request.state.laborantSession || '';
    var visitorUaData = request.plugins.scooter;
    var visitorBrowser = visitorUaData.family + ' ' + visitorUaData.major + '.' + visitorUaData.minor + '.' + visitorUaData.patch || 'unknown';
    var visitorDevice = visitorUaData.device.family || 'unknown';
    var visitorOs = visitorUaData.os.family + ' ' + visitorUaData.os.major + '.' + visitorUaData.os.minor + '.' + visitorUaData.os.patch || 'unknown';
    var visitorCountry;
    var newVisitor;
    var ip;

    var visitorCallback = function (err, visitor) {
      console.log(err);
      if (err) {
        next(err, null);
      } else {
        next(null, visitor);
      }
    };

    if (sessionId) {
      // if present - request a visitor with sessionId from cookie
      Visitor.findOne(sessionId).exec(visitorCallback);
    } else {
      // if not - create new visitor

      ip = request.info.remoteAddress;

      visitorCountry = geoip.lookup(ip);

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
