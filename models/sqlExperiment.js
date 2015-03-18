/*jslint node: true, es5: true, indent: 2*/

"use strict";

module.exports = function(sequelize, DataTypes) {
  var Experiment = sequelize.define("Experiment", {
    name          : { type: DataTypes.STRING, allowNull: false },
    description   : { type: DataTypes.STRING, allowNull: false },
    tag           : { type: DataTypes.STRING, allowNull: false },
    variantCount  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
    trackPercent  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
    fullOn        : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
  }, {
    classMethods: {
      associate: function(models) {
        Experiment.belongsTo(models.Project);
        Experiment.hasMany(models.Goal);
      }
    }
  });

  return Experiment;
};
