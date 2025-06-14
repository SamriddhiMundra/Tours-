const crypto = require('crypto');
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
      role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
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
      },
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpires: Date
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
userSchema.pre('save', function(next){
  if(!this.isModified('password') || this.isNew){
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
})

//INSTANCE METHOD
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
  //this.password is not available because we did select: false in password
  return await bcrypt.compare(candidatePassword, userPassword);
}
//ANOTHER INSTANCE METHOD
userSchema.methods.changePassword = async function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }
  //false means not changed
  return false;
}

userSchema.methods.createPasswordResetToken = function(){
const resetToken = crypto.randomBytes(32).toString('hex');
this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
console.log({resetToken}, this.passwordResetToken )
this.passwordResetExpires = Date.now() + 10*60*1000;
return resetToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;