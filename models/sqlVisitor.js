/*jslint node: true, indent: 2*/

'use strict';

module.exports = function (sequelize, DataTypes) {
  var Visitor = sequelize.define('Visitor', {
    identity  : { type: DataTypes.STRING, allowNull: false, unique: true, primaryKey: true }
    // find a way to store all experiments and their variants, assigned to this user
  }, {
    classMethods: {
      associate: function (models) {
        Visitor.hasMany(models.VisitorExperiments);
        Visitor.hasMany(models.Event);
      }
    }
  });

  return Visitor;
};
