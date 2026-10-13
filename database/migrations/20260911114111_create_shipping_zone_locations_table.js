exports.up = function (knex) {
  return knex.schema.createTable("shipping_zone_locations", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("shipping_zone_id")
      .unsigned()
      .notNullable();

    table
      .string("country", 100)
      .notNullable();

    table
      .string("state", 100)
      .nullable();

    table
      .string("city", 100)
      .nullable();

    table
      .string("postal_code", 20)
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("shipping_zone_id")
      .references("id")
      .inTable("shipping_zones")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["shipping_zone_id"]);
    table.index(["country"]);
    table.index(["state"]);
    table.index(["postal_code"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shipping_zone_locations");
};