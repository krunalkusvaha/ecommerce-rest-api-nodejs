const messages = require("../constants/messages");
const { successResponse } = require("../utils/response");
const asyncHandler = require("../utils/asyncHandler");

const home = asyncHandler(async (req, res) => {
  return successResponse(
    res,
    null,
    messages.SERVER.RUNNING
  );
});

module.exports = {
  home,
};