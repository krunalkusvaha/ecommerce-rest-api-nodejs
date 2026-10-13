const path = require("path");

const categoryRepository = require("../repositories/category.repository");
const { deleteFile } = require("../utils/file");

const createCategory = async ({
  name,
  slug,
  description,
  image,
  sort_order,
}) => {
  const normalizedName = name.trim();
  const normalizedSlug =
    slug.trim().toLowerCase();

  const existingCategory =
    await categoryRepository.findBySlug(
      normalizedSlug
    );

  if (existingCategory) {
    const error = new Error(
      "Category slug is already registered"
    );

    error.statusCode = 409;

    throw error;
  }

  const categoryId =
    await categoryRepository.createCategory({
      name: normalizedName,
      slug: normalizedSlug,
      description: description
        ? description.trim()
        : null,
      image: image || null,
      sort_order:
        sort_order !== undefined
          ? Number(sort_order)
          : 0,
    });

  return await categoryRepository.findById(
    categoryId
  );
};

const getCategories = async () => {
  return await categoryRepository.findAll();
};

const getCategoryById = async (id) => {
  const category =
    await categoryRepository.findById(id);

  if (!category) {
    const error = new Error(
      "Category not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return category;
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
  const existingCategory =
    await categoryRepository.findById(id);

  if (!existingCategory) {
    const error = new Error(
      "Category not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const normalizedSlug =
    slug !== undefined
      ? slug.trim().toLowerCase()
      : existingCategory.slug;

  const categoryWithSameSlug =
    await categoryRepository.findBySlug(
      normalizedSlug
    );

  if (
    categoryWithSameSlug &&
    categoryWithSameSlug.id !== Number(id)
  ) {
    const error = new Error(
      "Category slug is already registered"
    );

    error.statusCode = 409;

    throw error;
  }

  const newImage =
    image !== undefined
      ? image
      : existingCategory.image;

  const updatedData = {
    name:
      name !== undefined
        ? name.trim()
        : existingCategory.name,

    slug: normalizedSlug,

    description:
      description !== undefined
        ? description.trim()
        : existingCategory.description,

    image: newImage,

    sort_order:
      sort_order !== undefined
        ? Number(sort_order)
        : existingCategory.sort_order,
  };

  await categoryRepository.updateCategory(
    id,
    updatedData
  );

  // Delete old image after successful DB update
  if (
    image !== undefined &&
    existingCategory.image &&
    existingCategory.image !== newImage
  ) {
    deleteFile(
      path.join(
        "categories",
        existingCategory.image
      )
    );
  }

  return await categoryRepository.findById(id);
};

const updateCategoryStatus = async (
  id
) => {
  const category =
    await categoryRepository.findById(id);

  if (!category) {
    const error = new Error(
      "Category not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const newStatus =
    category.status === "active"
      ? "inactive"
      : "active";

  await categoryRepository.updateStatus(
    id,
    newStatus
  );

  return await categoryRepository.findById(id);
};

const deleteCategory = async (id) => {
  const category =
    await categoryRepository.findById(id);

  if (!category) {
    const error = new Error(
      "Category not found"
    );

    error.statusCode = 404;

    throw error;
  }

  try {
    await categoryRepository.deleteCategory(id);
  } catch (error) {
    // MySQL foreign key constraint
    // prevents deleting category when
    // another table is using this category.
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      const deleteError = new Error(
        "Category cannot be deleted because it is being used by other records"
      );

      deleteError.statusCode = 409;

      throw deleteError;
    }

    throw error;
  }

  // Delete image only after database deletion succeeds.
  if (category.image) {
    deleteFile(
      path.join(
        "categories",
        category.image
      )
    );
  }

  return true;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};