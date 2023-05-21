const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
mongoose.connect('mongodb://127.0.0.1:27017/Authentication', { useNewUrlParser: true })
var db = mongoose.connection;

var UserSchema = mongoose.Schema({
    username:{
        type:String,
        index:true
    },
    password:{
        type:String,
        required:true,

    },
    email:{
        type:String
    },
    name:{
        type:String
    },
    profileimage:{
        type:String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcrypt.hash(newUser.password, 10, function(err, hash){
		if(err) throw err;
		// set hashed password
		newUser.password = hash;
		// create user
		newUser.save(callback);
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) return callback(err);
		callback(null, isMatch);
	});
}