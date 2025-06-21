/* eslint-disable import/no-dynamic-require */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //we cannot use ./views

//1 GLOBAL MIDDLEWARES

//serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public'))); //we cannot use ./public
//all static files are served from public folder

//set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  //this is available in every file in project
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require(`${__dirname}/routes/viewRoutes`);

//Body Parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));

//data sanitization against NoSQL query injections
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));



// app.use((req, res, next) => {
//   console.log('Hello from middleware!');
//   next();
// });

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});


app.use('/', viewRouter); //this is for pug files, so that we can render them
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on the server`
  // });
  
  // const err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use((err, req, res, next) => {
  console.log('🔥 GLOBAL ERROR HANDLER CALLED:', err.message); // <- this MUST appear
  globalErrorHandler(err, req, res, next);
});




module.exports = app;

