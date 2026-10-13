exports.up = function (knex) {
  return knex.schema.createTable("tags", function (table) {
    table.bigIncrements("id").primary();

    table
      .string("name", 100)
      .notNullable();

    table
      .string("slug", 120)
      .notNullable()
      .unique();

    table
      .enum("status", ["active", "inactive"])
      .notNullable()
      .defaultTo("active");

    table.timestamps(true, true);

    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("tags");
};