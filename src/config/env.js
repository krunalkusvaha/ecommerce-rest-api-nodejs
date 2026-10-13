require("dotenv").config();

const env = {
  // Server
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || "ecommerce_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
};

module.exports = env;