/*jslint node: true, nomen: true, indent: 2, vars: true, regexp: true */

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
  sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL);
} else if (process.env.OPENSHIFT_MYSQL_DB_URL) {
  sequelize = new Sequelize(process.env.OPENSHIFT_MYSQL_DB_URL);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}


fs
  .readdirSync(__dirname)
  .filter(function (file) {
    var condition = (file.indexOf('.') !== 0) && (file !== basename) && (file.indexOf('sql') === 0);

    if (condition && env === 'development') {
      console.log('loading model from', file);
    }

    return condition;
  })
  .forEach(function (file) {
    var model = sequelize['import'](path.join(__dirname, file));
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
