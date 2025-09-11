const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const sendResponse = require('../utils/response');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return sendResponse(res, { status: 401, message: "No token provided" });

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return sendResponse(res, { status: 403, message: "Forbidden" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return sendResponse(res, { status: 498, message: "Token expired" });
      }
      return sendResponse(res, { status: 498, message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;
