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
  },
  views: {
    engines: {
      jade: require("jade")
    },
    path: "./views",
    // TODO: remove on deploy
    isCached: false
  }
};