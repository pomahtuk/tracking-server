/*jslint node: true, indent: 2*/

'use strict';

module.exports = function (sequelize, DataTypes) {

  var MetricResult = sequelize.define('MetricResult', {
    totalVisitors       : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    visitorsWithMetric  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    conversion          : { type: DataTypes.FLOAT, allowNull: false }
  }, {
    classMethods: {
      associate: function (models) {
        MetricResult.belongsTo(models.Experiment);
        MetricResult.belongsTo(models.Goal);
        // MetricResult.belongsTo(models.Project);
      }
    }
  });

  return MetricResult;
};
