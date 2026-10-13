exports.up = function (knex) {
  return knex.schema.createTable("coupon_products", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("coupon_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("coupon_id")
      .references("id")
      .inTable("coupons")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["coupon_id"]);
    table.index(["product_id"]);

    table.unique(["coupon_id", "product_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("coupon_products");
};