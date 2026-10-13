exports.up = function (knex) {
  return knex.schema.createTable("order_status_histories", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable();

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
      .notNullable();

    table
      .bigInteger("changed_by")
      .unsigned()
      .nullable();

    table
      .text("note")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("changed_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.index(["order_id"]);
    table.index(["status"]);
    table.index(["changed_by"]);
    table.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_status_histories");
};