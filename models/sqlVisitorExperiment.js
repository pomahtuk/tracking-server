/*jslint node: true, es5: true, indent: 2*/

"use strict";

module.exports = function (sequelize, DataTypes) {
  var VisitorExperiments = sequelize.define("VisitorExperiments", {
    variant:  { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {
    classMethods: {
      associate: function (models) {
        VisitorExperiments.belongsTo(models.Visitor);
        VisitorExperiments.hasOne(models.Experiment);
      }
    }
  });

  return VisitorExperiments;
};
