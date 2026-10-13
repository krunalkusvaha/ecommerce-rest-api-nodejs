exports.up = function (knex) {
  return knex.schema.createTable("product_images", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .string("image", 500)
      .notNullable();

    table
      .boolean("is_primary")
      .notNullable()
      .defaultTo(false);

    table
      .integer("sort_order")
      .notNullable()
      .defaultTo(0);

    table.timestamps(true, true);

    // Foreign Key
    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Index
    table.index(["product_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_images");
};