const { executeQuery } = require("./base.repository");

const testDatabase = async () => {
  const result = await executeQuery("SELECT 1 AS database_test");

  return result[0];
};

module.exports = {
  testDatabase,
};