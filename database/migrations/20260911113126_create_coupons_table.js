exports.up = function (knex) {
  return knex.schema.createTable("coupons", function (table) {
    table.bigIncrements("id").primary();

    table
      .string("code", 50)
      .notNullable()
      .unique();

    table
      .string("name", 100)
      .notNullable();

    table
      .text("description")
      .nullable();

    table
      .enum("discount_type", ["percentage", "fixed"])
      .notNullable();

    table
      .decimal("discount_value", 12, 2)
      .notNullable();

    table
      .decimal("minimum_order_amount", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("maximum_discount_amount", 12, 2)
      .nullable();

    table
      .integer("usage_limit")
      .unsigned()
      .nullable();

    table
      .integer("used_count")
      .unsigned()
      .notNullable()
      .defaultTo(0);

    table
      .timestamp("starts_at")
      .nullable();

    table
      .timestamp("expires_at")
      .nullable();

    table
      .enum("status", ["active", "inactive"])
      .notNullable()
      .defaultTo("active");

    table.timestamps(true, true);

    table.index(["status"]);
    table.index(["starts_at"]);
    table.index(["expires_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("coupons");
};