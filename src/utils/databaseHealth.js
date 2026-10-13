const pool = require("../config/database");

const checkDatabaseConnection = async () => {
  try {
    await pool.query("SELECT 1");

    return {
      connected: true,
      message: "Database connection is healthy",
    };
  } catch (error) {
    return {
      connected: false,
      message: "Database connection failed",
      error: error.message,
    };
  }
};

module.exports = {
  checkDatabaseConnection,
};