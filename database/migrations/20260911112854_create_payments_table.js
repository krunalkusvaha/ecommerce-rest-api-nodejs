exports.up = function (knex) {
  return knex.schema.createTable("payments", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable();

    table
      .string("transaction_id", 150)
      .nullable()
      .unique();

    table
      .string("payment_gateway", 50)
      .nullable();

    table
      .enum("method", [
        "cod",
        "card",
        "upi",
        "net_banking",
        "wallet",
      ])
      .notNullable();

    table
      .decimal("amount", 12, 2)
      .notNullable();

    table
      .enum("status", [
        "pending",
        "processing",
        "successful",
        "failed",
        "refunded",
      ])
      .notNullable()
      .defaultTo("pending");

    table
      .text("gateway_response")
      .nullable();

    table
      .timestamp("paid_at")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["order_id"]);
    table.index(["status"]);
    table.index(["payment_gateway"]);
    table.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("payments");
};