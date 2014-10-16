/**
 * Created by pman on 16.10.14.
 */
var Mongoose  = require('mongoose'),
    Schema    = Mongoose.Schema;

// The data schema for an event that we're tracking in our analytics engine
var targetSchema = new Schema({
  name          : { type: String,   required: true, trim: true },
  description   : { type: String,   required: true, trim: true },
  dateCreated   : { type: Date,     required: true, default: Date.now }
});

var target = Mongoose.model('target', targetSchema);

module.exports = {
  Target: target
};