/*jslint node: true, es5: true, indent: 2*/

"use strict";

var exports = function (server) {
  exports.index(server);
  exports.styleguide(server);
  exports.templates(server);
};

module.exports = exports;

exports.index = function (server) {
  server.route({
    path: "/",
    method: "GET",
    handler: function (request, reply) {
      reply.view('views/index');
    }
  });
  server.route({
    path: "/auth",
    method: "GET",
    handler: function (request, reply) {
      reply.view('views/index');
    }
  });
};

exports.styleguide = function (server) {
  server.route({
    path: "/styleguide.html",
    method: "GET",
    handler: function (request, reply) {
      reply.view('views/styleguide');
    }
  });
};

exports.templates = function (server) {
  server.route({
    path: "/templates/{path*}",
    method: "GET",
    handler: function (request, reply) {
      var paramsArray = request.params.path.split('/'),
        moduleName = paramsArray.splice(0, 1),
        pathString = 'public/app/' + moduleName + '/templates/' + paramsArray.join('/');

      pathString = pathString.split('.html').join('.jade');

      reply.view(pathString);
    }
  });
};
