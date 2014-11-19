/*jslint node: true, es5: true, indent: 2*/

// Config for server instace
module.exports = {
  cache: {
    engine: require("catbox-memory"), // check for other caching backends
    shared: true,
    options: {}
  },
  cors: {
    origin: ['*'],
    isOriginExposed: false
  },
  validation : {
    allowUnknown : true
  }
};
