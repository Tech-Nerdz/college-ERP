import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack.red);

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds the limit'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference value';
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler;
