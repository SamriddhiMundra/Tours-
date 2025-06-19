//const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');



exports.setTourUserIds = (req, res, next) => {
//Allowing nested routes
if(!req.body.tour) req.body.tour = req.params.tourId; //if tourId is not provided in body, use the one from params
if(!req.body.user) req.body.user = req.user.id; //if user is not provided in body, use the one from authenticated user
next();
}

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);