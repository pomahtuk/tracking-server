/**
 * Created by pman on 12.10.14.
 */
var Mongoose  = require('mongoose'),
    Schema    = Mongoose.Schema;

var goalSchema = new Schema({
  name          : { type: String,   required: true, trim: true },
  description   : { type: String,   required: true, trim: true },
  dateCreated   : { type: Date,     required: true, default: Date.now }
});

var goal = Mongoose.model('goal', goalSchema);

module.exports = {
  Goal: goal
};