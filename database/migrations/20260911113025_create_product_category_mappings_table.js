exports.up = function (knex) {
  return knex.schema.createTable("product_category_mappings", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("category_id")
      .unsigned()
      .notNullable();

    table
      .boolean("is_primary")
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
      .foreign("category_id")
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["category_id"]);

    table.unique(["product_id", "category_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_category_mappings");
};