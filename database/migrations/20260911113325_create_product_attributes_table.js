exports.up = function (knex) {
  return knex.schema.createTable("product_attributes", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .string("attribute_name", 100)
      .notNullable();

    table
      .text("attribute_value")
      .notNullable();

    table
      .integer("sort_order")
      .notNullable()
      .defaultTo(0);

    table.timestamps(true, true);

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["attribute_name"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_attributes");
};