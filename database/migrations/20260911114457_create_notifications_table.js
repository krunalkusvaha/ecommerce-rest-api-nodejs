exports.up = function (knex) {
  return knex.schema.createTable("notifications", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .string("type", 100)
      .notNullable();

    table
      .string("title", 200)
      .notNullable();

    table
      .text("message")
      .notNullable();

    table
      .text("data")
      .nullable();

    table
      .timestamp("read_at")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["type"]);
    table.index(["read_at"]);
    table.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("notifications");
};