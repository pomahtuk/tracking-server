/*jslint node: true, es5: true, indent: 2*/


// // The data schema for an event that we're tracking in our analytics engine
// var experimentSchema = new Schema({
//   name          : { type: String,   required: true, trim: true },
//   description   : { type: String,   required: true, trim: true },
//   tag           : { type: String,   required: true, trim: true },
//   variantCount  : { type: Number,   required: true},
//   trackPercent  : { type: Number,   required: true},
//   fullOn        : { type: Boolean,  required: true, default: false},
//   goal          : { type : Schema.ObjectId, ref : 'goal' },
//   dateCreated   : { type: Date,     default: new Date() }
// });

// var experiment = Mongoose.model('experiment', experimentSchema);


"use strict";

module.exports = function(sequelize, DataTypes) {
  var Experiment = sequelize.define("Experiment", {
    name          : { type: DataTypes.STRING, allowNull: false },
    description   : { type: DataTypes.STRING, allowNull: false },
    tag           : { type: DataTypes.STRING, allowNull: false },
    variantCount  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
    trackPercent  : { type: DataTypes.INTEGER.UNSIGNED, allowNull: false},
    fullOn        : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
    // goal          : { type : Schema.ObjectId, ref : 'goal' }
  }, {
    // classMethods: {
    //   associate: function(models) {
    //     Task.belongsTo(models.User);
    //   }
    // }
  });

  return Experiment;
};


// module.exports = function(sequelize, DataTypes) {
//   var Experiment = sequelize.define('experiment', {
//     name          : { type: DataTypes.STRING, allowNull: false },
//     description   : { type: DataTypes.STRING, allowNull: false },
//     tag           : { type: DataTypes.STRING, allowNull: false },
//     variantCount  : { type: DataTypes.INTEGER, allowNull: false},
//     trackPercent  : { type: DataTypes.INTEGER, allowNull: false},
//     fullOn        : { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
//     goal          : { type : Schema.ObjectId, ref : 'goal' },
//     dateCreated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
//   }, {
//     classMethods: {
//       associate: function(models) {
//         // Experiment.belongsTo(models.Project);
//         Experiment.hasOne(models.Goal);
//       }
//     }
//   });

//   return Experiment;
// }
