const messages = require("../constants/messages");

const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `${messages.SERVER.ROUTE_NOT_FOUND}: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFoundMiddleware;