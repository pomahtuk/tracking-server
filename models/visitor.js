/**
 * Created by pman on 16.10.14.
 */
var Mongoose  = require('mongoose'),
    Schema    = Mongoose.Schema;

// The data schema for an event that we're tracking in our analytics engine
var visitorSchema = new Schema({
  sessionKey    : { type: String, required: true, trim: true },
  browser       : { type: String, required: true, trim: true },
  lang          : { type: String, required: true, trim: true },
  ip            : { type: String, required: true, trim: true },
  referrer      : { type: String, required: true, trim: true },
  country       : { type: String, required: true, trim: true }
});

var visitor = Mongoose.model('visitor', visitorSchema);

module.exports = {
  Visitor: visitor
};