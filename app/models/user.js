var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case'); // Import Mongoose Title Case Plugin
var validate = require('mongoose-validator'); // Import Mongoose Validator Plugin

// User E-mail Validator
var emailValidator = [
  validate({
    validator: 'matches',
    arguments: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/,
    message: 'Name must be at least 3 characters, max 40, no special characters or numbers, must have space in between name.'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 40],
    message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

// Username Validator
var usernameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
  }),
  validate({
    validator: 'isAlphanumeric',
    message: 'Username must contain letters and numbers only'
  })
];

// Password Validator
var passwordValidator = [
  validate({
    validator: 'matches',
    arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
    message: 'Password needs to have at least one lower case, one uppercase, one number, one special character, and must be at least 8 characters but no more than 35.'
  }),
  validate({
    validator: 'isLength',
    arguments: [8, 35],
    message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
  })
];

// User Mongoose Schema
var UserSchema = new Schema({
  firstname: {type: String, required: true },
  lastname:  {type: String, required: true },
  username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator },
  password: { type: String, required: true, validate: passwordValidator, select: false },
  email: { type: String, required: true, lowercase: true, unique: true, validate: emailValidator },
  active: { type: Boolean, required: true, default: false },
  temporarytoken: { type: String, required: true },
  resettoken: { type: String, required: false }
});

UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next(); 
  bcrypt.hash(user.password,null,null, function (err, hash) {
    if(err)
      return next(err);
      user.password = hash;
      next();
  });
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password,this.password);
};

UserSchema.plugin(titlize, {
  paths: ['firstname','lastname']
});

module.exports = mongoose.model('User', UserSchema);
