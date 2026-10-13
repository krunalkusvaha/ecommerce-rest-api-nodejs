exports.up = function (knex) {
  return knex.schema.createTable("carts", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .enum("status", ["active", "converted", "abandoned"])
      .notNullable()
      .defaultTo("active");

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("carts");
};