/**
 * Created by pman on 06.10.14.
 */
var Mongoose  = require('mongoose'),
    Schema    = Mongoose.Schema;

// The data schema for an event that we're tracking in our analytics engine
var experimentSchema = new Schema({
  name          : { type: String,   required: true, trim: true },
  description   : { type: String,   required: true, trim: true },
  tag           : { type: String,   required: true, trim: true },
  variantCount  : { type: Number,   required: true},
  trackPercent  : { type: Number,   required: true},
  fullOn        : { type: Boolean,  required: true, default: false},
  dateCreated   : { type: Date,     required: true, default: Date.now }
  // experiment variant should be referenced here ideally by Embedded document;
});

var experiment = Mongoose.model('experiment', experimentSchema);

module.exports = {
  Experiment: experiment
};