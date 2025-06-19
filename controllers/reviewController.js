const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next)=>{
    let filter = {}
    if(req.params.tourId) filter={tour: req.params.tourId}; //if tourId is provided in params, filter reviews by tourId
    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    })
})
exports.createReview = catchAsync(async (req, res, next) => {
    //Allowing nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId; //if tourId is not provided in body, use the one from params
    if(!req.body.user) req.body.user = req.user.id; //if user is not provided in body, use the one from authenticated user
    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    })
});
exports.deleteReview = factory.deleteOne(Review);