const crypto = require("crypto");

const userSessionRepository = require("../repositories/userSession.repository");
const userRepository = require("../repositories/user.repository");

const authMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const authorization =
      req.get("Authorization");

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token is required",
      });
    }

    const [scheme, token] =
      authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format",
      });
    }

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const session =
      await userSessionRepository.findActiveSessionByTokenHash(
        tokenHash
      );

    if (!session) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired session",
      });
    }

    const user =
      await userRepository.findById(
        session.user_id
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "User account is inactive",
      });
    }

    await userSessionRepository.updateLastActivity(
      session.id
    );

    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;