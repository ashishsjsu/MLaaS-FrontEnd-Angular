var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({

	username: {type: String},
	password: {type: String},
	phone: {type: String},
	email: {type: String},
});

module.exports = mongoose.model('User', UserSchema, 'User');