exports.up = function (knex) {
  return knex.schema.createTable("addresses", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
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

    table
      .enum("address_type", ["shipping", "billing"])
      .notNullable()
      .defaultTo("shipping");

    table
      .boolean("is_default")
      .notNullable()
      .defaultTo(false);

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["address_type"]);
    table.index(["is_default"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("addresses");
};