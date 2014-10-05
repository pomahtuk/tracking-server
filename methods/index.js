/**
 * Add your other methods below.
 *
 * @param server
 */
exports.init = function(server) {

  server.method("getColour", function(name, next) {
    var colours = ["red", "blue", "indigo", "violet", "green"];
    var colour = colours[Math.floor(Math.random() * colours.length)];
    next(null, colour);
  }, {
    cache: {
      expiresIn: 30000
    }
  });

};
