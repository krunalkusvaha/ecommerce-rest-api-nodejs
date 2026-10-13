exports.up = function (knex) {
  return knex.schema.createTable("permissions", function (table) {
    table.bigIncrements("id").primary();

    table
      .string("name", 100)
      .notNullable();

    table
      .string("slug", 150)
      .notNullable()
      .unique();

    table
      .text("description")
      .nullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("permissions");
};