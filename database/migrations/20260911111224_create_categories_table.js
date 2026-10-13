/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("categories", function (table) {
        table.bigIncrements("id").primary();

        table
        .string("name", 100)
        .notNullable();

        table
        .string("slug", 120)
        .notNullable()
        .unique();

        table
        .text("description")
        .nullable();

        table
        .string("image", 500)
        .nullable();

        table
        .enum("status", ["active", "inactive"])
        .notNullable()
        .defaultTo("active");

        table
        .integer("sort_order")
        .notNullable()
        .defaultTo(0);

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("categories");
};
