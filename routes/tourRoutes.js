const express = require('express');
const router = express.Router();

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//router.param('id', tourController.checkID);


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