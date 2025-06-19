const express = require('express');

const router = express.Router();

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const reviewRouter = require('./../routes/reviewRoutes');

//router.param('id', tourController.checkID);
// POST /tour/234fasd/reviews  --> Nested routes
//GET /tour/234fasd/reviews
//GET /tour/234fasd/reviews/5673df

// router.route('/:tourId/reviews')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// );

//router is actually a middleware, so we can use it to mount other routers
router.use('/:tourId/reviews', reviewRouter); //Mounting the review router on the tour router


router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);//using multiple handlers for same route(multiple middlewares..will get executed in sequence)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
         authController.restrictTo('admin', 'lead-guide'),
         tourController.deleteTour);


         

module.exports = router;