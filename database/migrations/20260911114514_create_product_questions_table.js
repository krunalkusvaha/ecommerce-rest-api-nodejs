exports.up = function (knex) {
  return knex.schema.createTable("product_questions", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable();

    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable();

    table
      .text("question")
      .notNullable();

    table
      .text("answer")
      .nullable();

    table
      .bigInteger("answered_by")
      .unsigned()
      .nullable();

    table
      .enum("status", ["pending", "answered", "rejected"])
      .notNullable()
      .defaultTo("pending");

    table.timestamps(true, true);

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("answered_by")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    table.index(["product_id"]);
    table.index(["user_id"]);
    table.index(["answered_by"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("product_questions");
};