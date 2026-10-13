exports.up = function (knex) {
  return knex.schema.createTable("product_tags", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .string("tag", 100)
      .notNullable();

    table.timestamps(true, true);

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["tag"]);

    table.unique(["product_id", "tag"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_tags");
};