exports.up = function (knex) {
  return knex.schema.createTable("order_shipping", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("shipping_method_id")
      .unsigned()
      .notNullable();

    table
      .string("method_name", 100)
      .notNullable();

    table
      .decimal("shipping_charge", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .string("tracking_number", 150)
      .nullable();

    table
      .string("carrier", 100)
      .nullable();

    table
      .timestamp("shipped_at")
      .nullable();

    table
      .timestamp("delivered_at")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("shipping_method_id")
      .references("id")
      .inTable("shipping_methods")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table.index(["order_id"]);
    table.index(["shipping_method_id"]);
    table.index(["tracking_number"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_shipping");
};