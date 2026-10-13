exports.up = function (knex) {
  return knex.schema.createTable("order_addresses", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable();

    table
      .enum("address_type", ["shipping", "billing"])
      .notNullable();

    table
      .string("name", 100)
      .notNullable();

    table
      .string("phone", 20)
      .notNullable();

    table
      .string("address_line_1", 255)
      .notNullable();

    table
      .string("address_line_2", 255)
      .nullable();

    table
      .string("city", 100)
      .notNullable();

    table
      .string("state", 100)
      .notNullable();

    table
      .string("country", 100)
      .notNullable()
      .defaultTo("India");

    table
      .string("postal_code", 20)
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["order_id"]);
    table.index(["address_type"]);

    table.unique(["order_id", "address_type"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_addresses");
};