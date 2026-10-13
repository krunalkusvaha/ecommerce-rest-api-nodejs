/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", function (table) {
        table.bigIncrements("id").primary();

        table.string("name", 100).notNullable();

        table.string("email", 150).notNullable().unique();

        table.string("password", 255).notNullable();

        table.string("phone", 20).nullable();

        table.enum("status", ["active", "inactive"]).notNullable().defaultTo("active");

        table.string("address", 255).nullable();

        table.enum("gender", ["male", "female", "other",]).nullable();

        table.string("profile_image", 255).nullable();

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("users");
};
