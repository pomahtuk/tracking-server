/*jslint node: true, indent: 2*/

'use strict';

module.exports = function (sequelize, DataTypes) {

  var MetricGraphPoint = sequelize.define('MetricGraphPoint', {
    totalVisitors       : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    visitorsWithMetric  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    conversion          : { type: DataTypes.FLOAT, allowNull: false },
    timestamp           : { type: DataTypes.DATE, allowNull: false }
  }, {
    classMethods: {
      associate: function (models) {
        MetricGraphPoint.belongsTo(models.Experiment);
        MetricGraphPoint.belongsTo(models.Goal);
      }
    }
  });

  return MetricGraphPoint;
};
