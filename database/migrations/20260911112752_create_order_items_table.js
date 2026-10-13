exports.up = function (knex) {
  return knex.schema.createTable("order_items", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
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
      .string("product_name", 200)
      .notNullable();

    table
      .string("sku", 100)
      .notNullable();

    table
      .string("variant_name", 150)
      .nullable();

    table
      .integer("quantity")
      .unsigned()
      .notNullable();

    table
      .decimal("unit_price", 12, 2)
      .notNullable();

    table
      .decimal("discount", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("total_price", 12, 2)
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
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

    table.index(["order_id"]);
    table.index(["product_id"]);
    table.index(["variant_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_items");
};