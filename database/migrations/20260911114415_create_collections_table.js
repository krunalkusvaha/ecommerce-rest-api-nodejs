exports.up = function (knex) {
  return knex.schema.createTable("collections", function (table) {
    table.bigIncrements("id").primary();

    table
      .string("name", 150)
      .notNullable();

    table
      .string("slug", 180)
      .notNullable()
      .unique();

    table
      .text("description")
      .nullable();

    table
      .string("image", 500)
      .nullable();

    table
      .enum("status", ["active", "inactive"])
      .notNullable()
      .defaultTo("active");

    table
      .integer("sort_order")
      .notNullable()
      .defaultTo(0);

    table.timestamps(true, true);

    table.index(["status"]);
    table.index(["sort_order"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("collections");
};