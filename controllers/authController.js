const crypto = require('crypto');
const {promisify} = require('util'); //ES6 destructuring
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync( async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm  //user cannot become admin!
        //role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync( async (req, res, next) => {
    //const email = req.body.email;
    const {email, password} = req.body;

    //1. Check if email and password exist
    if(!email || !password){
       return next(new AppError('Please provide email and password', 400));
    }

    //2. Check if user exists && password is correct
    const user = await User.findOne({email: email}).select('+password');
    
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password', 401))
    }
    //console.log(user);
    //3. If everything is fine, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    })
});

exports.protect = catchAsync(async(req, res, next) => {
    //1. Getting the token and check if it exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);
    if(!token){
        return next(new AppError('You are not logged in! Please login to get further access', 401))
    }

    //2. Verificationt token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    //3. Check if user still exists
   const currentUser = await User.findById(decoded.id);
   if(!currentUser){
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
   }

    //4. If user changes password after the jwt token is issued
    //create another instance method in usermodel
   if(await currentUser.changePassword(decoded.iat)){
    return next(new AppError('User recently changed password! Please login again.', 401))
   }


   //GRANT ACCESS TO PROTECTED ROUTE
   req.user = currentUser;
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles ['admin', 'lead-guide'] role='user'
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform the action', 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync( async(req, res, next) => {
//1. Get user based on POSTED email
const user = await User.findOne({ email: req.body.email});
if(!user){
    return next(new AppError('There is no user with this email address', 404));
}

//2. Generate random reset token.
//create instance method of user in usermodel
const resetToken = user.createPasswordResetToken();
await user.save({validateBeforeSave: false});

//3. Send it to user's email
const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`
try{
    await sendEmail({
        email:user.email,
        subject: 'Your password reset token (valid for 10 min only)',
        message
    })
    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    })
    
}
catch(err){
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    return next(new AppError('There was an error sending the email, try again later', 500))
}});


exports.resetPassword = catchAsync( async(req, res, next) => {
    //1. get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken})

    //2.if token is not expired and there is user, then set new password

    //3. update changedPasswordAt property for the user

    //4. log the user in, send jwt
  });
  

