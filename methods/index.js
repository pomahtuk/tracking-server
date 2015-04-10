/*jslint node: true, indent: 2*/

'use strict';

var geoip = require('geoip-lite');
// var Visitor = require('../models/visitor').Visitor; // Mongoose ODM

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

};
