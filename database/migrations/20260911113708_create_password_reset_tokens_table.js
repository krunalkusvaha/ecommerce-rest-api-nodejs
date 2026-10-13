exports.up = function (knex) {
  return knex.schema.createTable("password_reset_tokens", function (table) {
    table.bigIncrements("id").primary();

    table.bigInteger("user_id").unsigned().notNullable();

    // SHA-256 hash = 64 hexadecimal characters
    table.string("token_hash", 64).notNullable().unique();

    table.timestamp("expires_at").notNullable();
    table.timestamp("used_at").nullable();

    table.string("ip_address", 45).nullable();
    table.text("user_agent").nullable();

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["expires_at"]);
    table.index(["used_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("password_reset_tokens");
};