exports.up = function (knex) {
  return knex.schema.createTable("coupon_usages", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("coupon_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable();

    table
      .decimal("discount_amount", 12, 2)
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("coupon_id")
      .references("id")
      .inTable("coupons")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["coupon_id"]);
    table.index(["user_id"]);
    table.index(["order_id"]);

    table.unique(["coupon_id", "order_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("coupon_usages");
};