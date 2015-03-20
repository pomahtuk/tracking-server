/*jslint node: true, es5: true, indent: 2*/

"use strict";

module.exports = function (sequelize, DataTypes) {
  var Session = sequelize.define("Session", {
    hash: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    classMethods: {
      associate: function (models) {
        Session.belongsTo(models.User);
      }
    }
  });

  return Session;
};
