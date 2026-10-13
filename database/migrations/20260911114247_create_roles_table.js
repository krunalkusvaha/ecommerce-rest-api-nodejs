exports.up = function (knex) {
  return knex.schema.createTable("roles", function (table) {
    table.bigIncrements("id").primary();

    table
      .string("name", 100)
      .notNullable();

    table
      .string("slug", 100)
      .notNullable()
      .unique();

    table
      .text("description")
      .nullable();

    table
      .enum("status", ["active", "inactive"])
      .notNullable()
      .defaultTo("active");

    table.timestamps(true, true);

    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("roles");
};