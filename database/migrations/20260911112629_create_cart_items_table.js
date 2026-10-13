exports.up = function (knex) {
  return knex.schema.createTable("cart_items", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("cart_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("variant_id")
      .unsigned()
      .nullable();

    table
      .integer("quantity")
      .unsigned()
      .notNullable()
      .defaultTo(1);

    table
      .decimal("unit_price", 12, 2)
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("cart_id")
      .references("id")
      .inTable("carts")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table
      .foreign("variant_id")
      .references("id")
      .inTable("product_variants")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.index(["cart_id"]);
    table.index(["product_id"]);
    table.index(["variant_id"]);

    table.unique(["cart_id", "product_id", "variant_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("cart_items");
};