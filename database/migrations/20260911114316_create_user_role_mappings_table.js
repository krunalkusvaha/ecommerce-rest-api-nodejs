exports.up = function (knex) {
  return knex.schema.createTable("user_role_mappings", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("role_id")
      .unsigned()
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("role_id")
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["role_id"]);

    table.unique(["user_id", "role_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_role_mappings");
};