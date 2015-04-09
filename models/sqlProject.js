/*jslint node: true, es5: true, indent: 2*/

"use strict";

module.exports = function (sequelize, DataTypes) {
  var Project = sequelize.define("Project", {
    name          : { type: DataTypes.STRING, allowNull: false },
    description   : { type: DataTypes.STRING, allowNull: false },
    domain        : { type: DataTypes.STRING, allowNull: false },
    apiKey        : { type: DataTypes.STRING, allowNull: false, unique: true }
  }, {
    classMethods: {
      associate: function (models) {
        Project.hasMany(models.Goal);
        Project.hasMany(models.Experiment);
        Project.belongsToMany(models.User);
      }
    }
  });

  return Project;
};
