exports.up = function (knex) {
  return knex.schema.createTable("shipping_methods", function (table) {
    table.bigIncrements("id").primary();

    table
      .string("name", 100)
      .notNullable();

    table
      .string("code", 50)
      .notNullable()
      .unique();

    table
      .text("description")
      .nullable();

    table
      .decimal("price", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("free_shipping_min_amount", 12, 2)
      .nullable();

    table
      .integer("estimated_min_days")
      .unsigned()
      .nullable();

    table
      .integer("estimated_max_days")
      .unsigned()
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
  return knex.schema.dropTableIfExists("shipping_methods");
};