exports.up = function (knex) {
  return knex.schema.createTable("user_sessions", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .string("token_hash", 64)
      .notNullable()
      .unique();

    table
      .string("refresh_token_hash", 64)
      .nullable()
      .unique();

    table
      .string("device_name", 150)
      .nullable();

    table
      .string("device_type", 50)
      .nullable();

    table
      .string("ip_address", 45)
      .nullable();

    table
      .text("user_agent")
      .nullable();

    table
      .timestamp("last_activity_at")
      .nullable();

    table
      .timestamp("expires_at")
      .nullable();

    table
      .timestamp("revoked_at")
      .nullable();

    table
      .boolean("is_active")
      .notNullable()
      .defaultTo(true);

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["is_active"]);
    table.index(["expires_at"]);
    table.index(["last_activity_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_sessions");
};