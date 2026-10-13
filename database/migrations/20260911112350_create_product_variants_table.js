exports.up = function (knex) {
  return knex.schema.createTable("product_variants", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .string("sku", 100)
      .notNullable()
      .unique();

    table
      .string("name", 150)
      .nullable();

    table
      .string("size", 50)
      .nullable();

    table
      .string("color", 50)
      .nullable();

    table
      .decimal("price", 12, 2)
      .nullable();

    table
      .decimal("sale_price", 12, 2)
      .nullable();

    table
      .integer("stock_quantity")
      .notNullable()
      .defaultTo(0);

    table
      .boolean("status")
      .notNullable()
      .defaultTo(true);

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
  return knex.schema.dropTableIfExists("product_variants");
};