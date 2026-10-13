const messages = require("../constants/messages");
const { errorResponse } = require("../utils/response");

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  return errorResponse(
    res,
    err.message || messages.SERVER.INTERNAL_ERROR,
    statusCode
  );
};

module.exports = errorMiddleware;