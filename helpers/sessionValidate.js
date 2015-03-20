/*jslint node: true, es5: true, nomen: true, indent: 2*/

'use strict';

var sqlSession = require('../models').Session;      // Sequilize ORM
var sqlUser    = require('../models').User;         // Sequilize ORM

var exports = function (session, callback) {
  if (session && session !== 'undefined') {
    sqlSession.findOne({
      include: [
        { model: sqlUser }
      ],
      where: {
        hash: session.hash
      }
    }).then(function (session) {
      if (session && session.User) {
        callback(null, true, session.User);
      } else {
        callback(null, false, null);
      }
    }, function (err) {
      callback(err, false, null);
    });
  } else {
    callback(new Error('Session'), false, null);
  }
};

module.exports = exports;
