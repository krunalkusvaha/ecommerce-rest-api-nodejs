exports.up = function (knex) {
  return knex.schema.createTable("inventory_transactions", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("variant_id")
      .unsigned()
      .nullable();

    table
      .enum("type", [
        "purchase",
        "sale",
        "return",
        "adjustment",
        "restock",
        "damage",
        "cancelled",
      ])
      .notNullable();

    table
      .integer("quantity")
      .notNullable();

    table
      .integer("previous_quantity")
      .notNullable();

    table
      .integer("new_quantity")
      .notNullable();

    table
      .bigInteger("order_id")
      .unsigned()
      .nullable();

    table
      .text("note")
      .nullable();

    table.timestamps(true, true);

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table
      .foreign("variant_id")
      .references("id")
      .inTable("product_variants")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["variant_id"]);
    table.index(["order_id"]);
    table.index(["type"]);
    table.index(["created_at"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("inventory_transactions");
};