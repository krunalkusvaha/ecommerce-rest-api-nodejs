exports.up = function (knex) {
  return knex.schema.createTable("user_otps", function (table) {
    table.bigIncrements("id").primary();

    table
      .bigInteger("user_id")
      .unsigned()
      .nullable();

    table
      .string("identifier", 150)
      .notNullable();

    table
      .enum("identifier_type", ["email", "phone"])
      .notNullable();

    table
      .string("otp_hash", 255)
      .notNullable();

    table
      .enum("purpose", [
        "registration",
        "login",
        "forgot_password",
        "change_email",
        "change_phone",
      ])
      .notNullable();

    table
      .timestamp("expires_at")
      .notNullable();

    table
      .timestamp("verified_at")
      .nullable();

    table
      .integer("attempts")
      .unsigned()
      .notNullable()
      .defaultTo(0);

    table
      .boolean("is_used")
      .notNullable()
      .defaultTo(false);

    table.timestamps(true, true);

    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.index(["user_id"]);
    table.index(["identifier"]);
    table.index(["identifier_type"]);
    table.index(["purpose"]);
    table.index(["expires_at"]);
    table.index(["is_used"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_otps");
};