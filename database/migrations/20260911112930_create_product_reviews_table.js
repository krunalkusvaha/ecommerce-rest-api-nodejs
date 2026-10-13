exports.up = function (knex) {
  return knex.schema.createTable("product_reviews", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("order_id")
      .unsigned()
      .nullable();

    table
      .tinyint("rating")
      .unsigned()
      .notNullable();

    table
      .text("review")
      .nullable();

    table
      .enum("status", ["pending", "approved", "rejected"])
      .notNullable()
      .defaultTo("pending");

    table
      .boolean("is_verified_purchase")
      .notNullable()
      .defaultTo(false);

    table.timestamps(true, true);

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["user_id"]);
    table.index(["order_id"]);
    table.index(["status"]);
    table.index(["rating"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_reviews");
};