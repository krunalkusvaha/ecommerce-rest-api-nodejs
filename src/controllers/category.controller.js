const categoryService = require("../services/category.service");
const asyncHandler = require("../utils/asyncHandler");
const {
  successResponse,
} = require("../utils/response");

const getImageUrl = (
  req,
  filename
) => {
  if (!filename) {
    return null;
  }

  return `${req.protocol}://${req.get(
    "host"
  )}/uploads/categories/${filename}`;
};

const formatCategory = (
  req,
  category
) => {
  if (!category) {
    return category;
  }

  return {
    ...category,
    image: getImageUrl(
      req,
      category.image
    ),
  };
};

const createCategory = asyncHandler(
  async (req, res) => {
    const {
      name,
      slug,
      description,
      sort_order,
    } = req.body;

    const image = req.file
      ? req.file.filename
      : null;

    const category =
      await categoryService.createCategory({
        name,
        slug,
        description,
        image,
        sort_order,
      });

    return successResponse(
      res,
      formatCategory(req, category),
      "Category created successfully",
      201
    );
  }
);

const getCategories = asyncHandler(
  async (req, res) => {
    const categories =
      await categoryService.getCategories();

    const formattedCategories =
      categories.map((category) =>
        formatCategory(req, category)
      );

    return successResponse(
      res,
      formattedCategories,
      "Categories fetched successfully"
    );
  }
);

const getCategoryById = asyncHandler(
  async (req, res) => {
    const category =
      await categoryService.getCategoryById(
        req.params.id
      );

    return successResponse(
      res,
      formatCategory(req, category),
      "Category fetched successfully"
    );
  }
);

const updateCategory = asyncHandler(
  async (req, res) => {
    const {
      name,
      slug,
      description,
      sort_order,
    } = req.body;

    const image = req.file
      ? req.file.filename
      : undefined;

    const category =
      await categoryService.updateCategory(
        req.params.id,
        {
          name,
          slug,
          description,
          image,
          sort_order,
        }
      );

    return successResponse(
      res,
      formatCategory(req, category),
      "Category updated successfully"
    );
  }
);

const updateCategoryStatus =
  asyncHandler(
    async (req, res) => {
      const category =
        await categoryService.updateCategoryStatus(
          req.params.id
        );

      return successResponse(
        res,
        formatCategory(req, category),
        "Category status updated successfully"
      );
    }
  );

const deleteCategory = asyncHandler(
  async (req, res) => {
    await categoryService.deleteCategory(
      req.params.id
    );

    return successResponse(
      res,
      null,
      "Category deleted permanently"
    );
  }
);

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
};