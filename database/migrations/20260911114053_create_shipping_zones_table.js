exports.up = function (knex) {
  return knex.schema.createTable("shipping_zones", function (table) {
    table.bigIncrements("id").primary();

    table.string("name", 100).notNullable();

    table.text("description").nullable();

    table
      .enum("status", ["active", "inactive"])
      .notNullable()
      .defaultTo("active");

    table.timestamps(true, true);

    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shipping_zones");
};