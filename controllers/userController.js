const AppError = require('../utils/appError');
const User = require(`./../models/userModel`);
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync( async (req, res, next) => {

    const users = await User.find();
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {users}
    })
})

exports.updateMe = (req, res, next) => {
    //1. create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates. Please use updateMyPassword', 400));

    }

    //2 update user document
    res.status(200).json({
        status: 'success'
    })
}
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    })
}
