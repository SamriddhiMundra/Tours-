const express = require('express');

const router = express.Router({mergeParams: true}); //mergeParams allows us to access params from parent router (tourRouter) in this router

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//POST /tour/234fasd/reviews 
//POST /reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,authController.restrictTo('user'), reviewController.createReview);

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;