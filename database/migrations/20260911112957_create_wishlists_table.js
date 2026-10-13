exports.up = function (knex) {
  return knex.schema.createTable("wishlists", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["product_id"]);

    table.unique(["user_id", "product_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("wishlists");
};