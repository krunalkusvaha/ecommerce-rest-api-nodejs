exports.up = function (knex) {
  return knex.schema.createTable("products", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("category_id")
      .unsigned()
      .notNullable();

    table
      .string("name", 200)
      .notNullable();

    table
      .string("slug", 220)
      .notNullable()
      .unique();

    table
      .string("sku", 100)
      .notNullable()
      .unique();

    table
      .text("description")
      .nullable();

    table
      .decimal("price", 12, 2)
      .notNullable();

    table
      .decimal("sale_price", 12, 2)
      .nullable();

    table
      .integer("stock_quantity")
      .notNullable()
      .defaultTo(0);

    table
      .string("status", 20)
      .notNullable()
      .defaultTo("active");

    table
      .boolean("is_featured")
      .notNullable()
      .defaultTo(false);

    table.timestamps(true, true);

    // Foreign Key
    table
      .foreign("category_id")
      .references("id")
      .inTable("categories")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    // Indexes
    table.index(["category_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("products");
};