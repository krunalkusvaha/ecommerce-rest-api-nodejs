const app = require("./src/app");
const env = require("./src/config/env");
const { checkDatabaseConnection } = require("./src/utils/databaseHealth");

const startServer = async () => {
  const database = await checkDatabaseConnection();

  if (!database.connected) {
    console.error(database.message);
    console.error(database.error);
    process.exit(1);
  }

  console.log(database.message);

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();