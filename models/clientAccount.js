/**
 * Created by pman on 06.10.14.
 */
var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

// The data schema for an event that we're tracking in our analytics engine
var clientAccountSchema = new Schema({
  name          : { type: String, required: true, trim: true },
  email         : { type: String, required: true, trim: true },
  password      : { type: String, required: true, trim: true },
  domain        : { type: String, required: true, trim: true },
  dateCreated   : { type: Date,   required: true, default: Date.now }
});

var clientAccount = Mongoose.model('client_account', clientAccountSchema);

module.exports = {
  ClientAccount: clientAccount
};