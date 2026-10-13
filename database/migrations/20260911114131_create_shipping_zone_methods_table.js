exports.up = function (knex) {
  return knex.schema.createTable("shipping_zone_methods", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("shipping_zone_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("shipping_method_id")
      .unsigned()
      .notNullable();

    table
      .decimal("price", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("free_shipping_min_amount", 12, 2)
      .nullable();

    table
      .boolean("status")
      .notNullable()
      .defaultTo(true);

    table.timestamps(true, true);

    table
      .foreign("shipping_zone_id")
      .references("id")
      .inTable("shipping_zones")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("shipping_method_id")
      .references("id")
      .inTable("shipping_methods")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["shipping_zone_id"]);
    table.index(["shipping_method_id"]);

    table.unique(["shipping_zone_id", "shipping_method_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shipping_zone_methods");
};