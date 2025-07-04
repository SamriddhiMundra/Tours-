const AppError = require("./../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}
const handleDuplicateFieldsDB = err => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
  //console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
}
const handleValidatorErrorDB = err =>{
  const errors = Object.values(err.errors).map(el=>el.message);
  const message= `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}
const handleJWTError = () => new AppError('Invalid Token, Please login again', 401);

const handleJWTExpiredError = () => new AppError('Token expired, Please login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err

  })
}

const sendErrorProd = (err, res) => {
  //operational, trusted error: send msg to client
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  }
  //programming or other unknown errors, dont leak details
  else{
    //1 log error
    console.error('ERROR', err);

    //2 send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    })
  }
  
}
module.exports = (err, req, res, next) =>{
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, res)
    }
    else if(process.env.NODE_ENV === 'production'){
      let error = { ...err };
error.message = err.message;
error.name = err.name;

      if(error.name === 'CastError') error = handleCastErrorDB(error);
      if(error.code === 11000) error = handleDuplicateFieldsDB(error);
      if(error.name === 'ValidationError') error = handleValidatorErrorDB(error);
      if(error.name === 'JsonWebTokenError') error = handleJWTError();
      if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();
      sendErrorProd(error, res);
    }

    
  }