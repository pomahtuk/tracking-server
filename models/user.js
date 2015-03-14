/*jslint node: true, es5: true*/

var Mongoose   = require('mongoose');
var Schema     = Mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true }//,
    // salt: { type: String, required: false },
    // hash: { type: String, required: false },
});

var User = Mongoose.model('users', UserSchema);

module.exports = {
  User: User
};
