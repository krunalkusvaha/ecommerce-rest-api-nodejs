const { executeQuery } = require("./base.repository");

const createCategory = async ({
  name,
  slug,
  description,
  image,
  sort_order,
}) => {
  const result = await executeQuery(
    `
      INSERT INTO categories
      (
        name,
        slug,
        description,
        image,
        status,
        sort_order,
        created_at,
        updated_at
      )
      VALUES
      (?, ?, ?, ?, 'active', ?, NOW(), NOW())
    `,
    [
      name,
      slug,
      description || null,
      image || null,
      sort_order ?? 0,
    ]
  );

  return result.insertId;
};

const findAll = async () => {
  return await executeQuery(
    `
      SELECT
        id,
        name,
        slug,
        description,
        image,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      ORDER BY sort_order ASC, id DESC
    `
  );
};

const findById = async (id) => {
  const result = await executeQuery(
    `
      SELECT
        id,
        name,
        slug,
        description,
        image,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return result[0] || null;
};

const findBySlug = async (slug) => {
  const result = await executeQuery(
    `
      SELECT
        id,
        name,
        slug,
        description,
        image,
        status,
        sort_order,
        created_at,
        updated_at
      FROM categories
      WHERE slug = ?
      LIMIT 1
    `,
    [slug]
  );

  return result[0] || null;
};

const updateCategory = async (
  id,
  {
    name,
    slug,
    description,
    image,
    sort_order,
  }
) => {
  const result = await executeQuery(
    `
      UPDATE categories
      SET
        name = ?,
        slug = ?,
        description = ?,
        image = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      name,
      slug,
      description || null,
      image || null,
      sort_order ?? 0,
      id,
    ]
  );

  return result.affectedRows > 0;
};

const updateStatus = async (
  id,
  status
) => {
  const result = await executeQuery(
    `
      UPDATE categories
      SET
        status = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [status, id]
  );

  return result.affectedRows > 0;
};

const deleteCategory = async (id) => {
  const result = await executeQuery(
    `
      DELETE FROM categories
      WHERE id = ?
    `,
    [id]
  );

  return result.affectedRows > 0;
};

module.exports = {
  createCategory,
  findAll,
  findById,
  findBySlug,
  updateCategory,
  updateStatus,
  deleteCategory,
};