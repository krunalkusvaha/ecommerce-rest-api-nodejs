exports.up = function (knex) {
  return knex.schema.createTable("role_permissions", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("role_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("permission_id")
      .unsigned()
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("role_id")
      .references("id")
      .inTable("roles")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("permission_id")
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["role_id"]);
    table.index(["permission_id"]);

    table.unique(["role_id", "permission_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("role_permissions");
};