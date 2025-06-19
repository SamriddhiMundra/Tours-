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
        authController.protect,
        authController.restrictTo('user'),
        reviewController.setTourUserIds, 
         reviewController.createReview);

router.route('/:id')
.get(reviewController.getReview)
.patch(reviewController.updateReview)
.delete(reviewController.deleteReview);

module.exports = router;