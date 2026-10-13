exports.up = function (knex) {
  return knex.schema.createTable("coupon_categories", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("coupon_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("category_id")
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
      .foreign("category_id")
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["coupon_id"]);
    table.index(["category_id"]);

    table.unique(["coupon_id", "category_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("coupon_categories");
};