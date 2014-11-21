/*jslint node: true, es5: true, indent: 2*/

"use strict";

var exports = function (server) {
  exports.index(server);
};

module.exports = exports;

exports.index = function (server) {
  server.route({
    path: "/",
    method: "GET",
    handler: function (request, reply) {
      reply.view('hello');
    }
  });
};
