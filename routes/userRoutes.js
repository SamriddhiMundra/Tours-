const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);// all routes after this will be protected, i.e. user must be logged in

router.patch('/updateMyPassword',  authController.updatePassword);
router.get('/me',  userController.getMe, userController.getUser); 
router.patch('/updateMe',  userController.updateMe)
router.delete('/deleteMe',  userController.deleteMe);

router.use(authController.restrictTo('admin')); // all routes after this will be restricted to admin only

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);



module.exports = router;