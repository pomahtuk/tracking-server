/*jslint node: true, es5: true, indent: 2*/

"use strict";

var exports = function (server) {
  exports.staticFiles(server);
};

module.exports = exports;

exports.staticFiles = function (server) {
  server.route({
    path: "/public/{path*}",
    method: "GET",
    handler: {
      directory: {
        path: "./public",
        listing: false,
        index: false
      }
    }
  });
};
