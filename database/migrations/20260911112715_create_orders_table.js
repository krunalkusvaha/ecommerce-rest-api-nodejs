exports.up = function (knex) {
  return knex.schema.createTable("orders", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .string("order_number", 50)
      .notNullable()
      .unique();

    table
      .enum("status", [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ])
      .notNullable()
      .defaultTo("pending");

    table
      .enum("payment_status", [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ])
      .notNullable()
      .defaultTo("pending");

    table
      .enum("payment_method", [
        "cod",
        "card",
        "upi",
        "net_banking",
        "wallet",
      ])
      .notNullable();

    table
      .decimal("subtotal", 12, 2)
      .notNullable();

    table
      .decimal("discount", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("shipping_charge", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("tax", 12, 2)
      .notNullable()
      .defaultTo(0);

    table
      .decimal("total_amount", 12, 2)
      .notNullable();

    table
      .text("customer_note")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["status"]);
    table.index(["payment_status"]);
    table.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("orders");
};