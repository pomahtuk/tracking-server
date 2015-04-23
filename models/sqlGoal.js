/*jslint node: true, indent: 2*/

'use strict';

module.exports = function (sequelize, DataTypes) {
  var Goal = sequelize.define('Goal', {
    name          : { type: DataTypes.STRING, allowNull: false },
    description   : { type: DataTypes.STRING, allowNull: false },
    tag           : { type: DataTypes.STRING, allowNull: false }
  }, {
    classMethods: {
      associate: function (models) {
        Goal.belongsToMany(models.Experiment);
        Goal.belongsTo(models.Project);
      }
    }
  });

  return Goal;
};
