const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'] //validator
      },
      email: {
        type: String,
        required: [true, 'A user must have an email id'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
      }, 
      photo: {
        type: String
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8

      },
      passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password']
      }
})

const User = mongoose.model('User', userSchema);
module.exports = User;