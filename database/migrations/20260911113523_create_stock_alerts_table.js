exports.up = function (knex) {
  return knex.schema.createTable("stock_alerts", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("variant_id")
      .unsigned()
      .nullable();

    table
      .integer("current_quantity")
      .notNullable();

    table
      .integer("threshold_quantity")
      .notNullable()
      .defaultTo(5);

    table
      .enum("alert_type", ["low_stock", "out_of_stock"])
      .notNullable();

    table
      .enum("status", ["pending", "resolved"])
      .notNullable()
      .defaultTo("pending");

    table
      .timestamp("resolved_at")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("variant_id")
      .references("id")
      .inTable("product_variants")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["variant_id"]);
    table.index(["alert_type"]);
    table.index(["status"]);
    table.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stock_alerts");
};