exports.up = function (knex) {
  return knex.schema.createTable(
    "product_collection_mappings",
    function (table) {
      table.bigIncrements("id").primary();

      table
        .bigInteger("product_id")
        .unsigned()
        .notNullable();

      table
        .bigInteger("collection_id")
        .unsigned()
        .notNullable();

      table.timestamps(true, true);

      table
        .foreign("product_id")
        .references("id")
        .inTable("products")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table
        .foreign("collection_id")
        .references("id")
        .inTable("collections")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");

      table.index(["product_id"]);
      table.index(["collection_id"]);

      table.unique(["product_id", "collection_id"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_collection_mappings");
};