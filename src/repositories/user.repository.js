const { executeQuery } = require("./base.repository");

const findByEmail = async (email) => {
  const result = await executeQuery(
    `
      SELECT
        id,
        name,
        email,
        password,
        phone,
        status,
        address,
        gender,
        profile_image,
        created_at,
        updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return result[0] || null;
};

const findByEmailExceptUser = async (
  email,
  userId
) => {
  const result = await executeQuery(
    `
      SELECT
        id,
        email
      FROM users
      WHERE email = ?
        AND id != ?
      LIMIT 1
    `,
    [email, userId]
  );

  return result[0] || null;
};

const createUser = async ({
  name,
  email,
  password,
  phone,
}) => {
  const result = await executeQuery(
    `
      INSERT INTO users
      (
        name,
        email,
        password,
        phone,
        status,
        created_at,
        updated_at
      )
      VALUES
      (?, ?, ?, ?, 'active', NOW(), NOW())
    `,
    [
      name,
      email,
      password,
      phone || null,
    ]
  );

  return result.insertId;
};

const findById = async (id) => {
  const result = await executeQuery(
    `
      SELECT
        id,
        name,
        email,
        phone,
        status,
        address,
        gender,
        profile_image,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return result[0] || null;
};

const updateProfile = async (
  userId,
  {
    name,
    email,
    phone,
    address,
    gender,
    profile_image,
  }
) => {
  const result = await executeQuery(
    `
      UPDATE users
      SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
        gender = ?,
        profile_image = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      name,
      email,
      phone || null,
      address || null,
      gender || null,
      profile_image || null,
      userId,
    ]
  );

  return result.affectedRows > 0;
};

module.exports = {
  findByEmail,
  findByEmailExceptUser,
  createUser,
  findById,
  updateProfile,
};