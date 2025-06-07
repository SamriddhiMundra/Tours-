/* eslint-disable import/no-dynamic-require */
const express = require('express');
const morgan = require('morgan');

const app = express();
if (process.env.NODE_ENV === 'development') {
  //this is available in every file in project
  app.use(morgan('dev'));
}

const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from middleware!');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
