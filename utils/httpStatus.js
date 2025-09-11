const HTTP_STATUS = {
  // ✅ Standard codes
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,   // invalid login, no token
  FORBIDDEN: 403,      // no permission
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,

  // ✅ Custom codes
  TOKEN_EXPIRED: 498,  // non-standard, used for expired/invalid tokens
  PAYMENT_REQUIRED: 402, // if you ever handle paid plans
};

module.exports = HTTP_STATUS;
