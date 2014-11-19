/*jslint node: true, es5: true, indent: 2*/

'use strict';

/**
 * Add your other routes below.
 * Each model might have a file that declares its
 * routes, such as the Events model.
 *
 * @param server
 */
exports.init = function (server) {
  require('./laborant')(server);
  require('./events')(server);
  require('./static')(server);

  // check for ua string
  server.route({
    method: 'GET',
    path: '/user-agent',
    handler: function (request, reply) {
      return reply(request.plugins.scooter.toJSON());
    }
  });

};
