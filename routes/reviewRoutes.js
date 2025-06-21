const express = require('express');

const router = express.Router({mergeParams: true}); //mergeParams allows us to access params from parent router (tourRouter) in this router

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//POST /tour/234fasd/reviews 
//POST /reviews


router.use(authController.protect); // all routes after this will be protected, i.e. user must be logged in

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds, 
         reviewController.createReview);

router.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;