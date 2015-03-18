/*jslint node: true, es5: true, indent: 2*/

"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username    : { type: DataTypes.STRING, allowNull: false, unique: true },
    password    : { type: DataTypes.STRING, allowNull: false },
    salt        : { type: DataTypes.STRING, allowNull: false }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Project);
        User.hasMany(models.Session);
      }
    }
  });

  return User;
};
