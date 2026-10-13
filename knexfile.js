const env = require("./src/config/env");

module.exports = {
  development: {
    client: "mysql2",

    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
    },

    migrations: {
      directory: "./database/migrations",
      tableName: "knex_migrations",
    },
  },
};