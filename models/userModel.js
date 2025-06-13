const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        minlength: 8,
        select: false

      },
      passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
          //this works only on CREATE and SAVE!
          validator: function(el){
            return el === this.password;
          },
          message: 'Passwords are not the same'
        }
      }
})


userSchema.pre('save', async function(next) {
  //only run this function if password was actually modified
  if(!this.isModified('password')){
    return next();
  }
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //hash is asynchronous version here, which returns a promise

  //delete passwordconfirm field
  this.passwordConfirm = undefined;
  next();
  
})

//INSTANCE METHOD
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
  //this.password is not available because we did select: false in password
  return await bcrypt.compare(candidatePassword, userPassword);
}

const User = mongoose.model('User', userSchema);
module.exports = User;