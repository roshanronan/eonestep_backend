// utils/response.js
function sendResponse(res, { status = 200, message = '', data = null }) {
  res.status(status).json({
    status,
    message,
    data
  });
}

module.exports = sendResponse;
