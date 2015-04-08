/*jslint node: true, es5: true, nomen: true, indent: 2, vars: true, regexp: true */

'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.json')[env];
var db        = {};
var sequelize;

if (config.logging !== false) {
  config.logging = require(__dirname + '/../helpers/sqlSyntax.js');
}

if (process.env.CLEARDB_DATABASE_URL) {
  var match = process.env.CLEARDB_DATABASE_URL.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  console.log(match);
  // the application is executed on Heroku ... use the postgres database
  sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL, {
    dialect:  'mysql',
    port:     match[4],
    host:     match[3],
    logging:  false
  })
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}


fs
  .readdirSync(__dirname)
  .filter(function (file) {
    var condition = (file.indexOf(".") !== 0) && (file !== basename) && (file.indexOf('sql') === 0);

    if (condition && env === "development") {
      console.log('loading model from', file);
    }

    return condition;
  })
  .forEach(function (file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].hasOwnProperty('associate')) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
