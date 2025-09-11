// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Server Error',
    data: null
  });
}

module.exports = errorHandler;
