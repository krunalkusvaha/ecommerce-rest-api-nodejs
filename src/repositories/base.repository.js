const pool = require("../config/database");

const executeQuery = async (query, params = []) => {
  const [result] = await pool.execute(query, params);

  return result;
};

module.exports = {
  executeQuery,
};