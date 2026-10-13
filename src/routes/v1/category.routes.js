const express = require("express");

const categoryController = require("../../controllers/category.controller");

const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../../validations/category.validation");

const {
  categoryUpload,
} = require("../../middlewares/upload.middleware");

const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| All Category APIs require login
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| Category CRUD
|--------------------------------------------------------------------------
*/

// Create
router.post(
  "/",
  categoryUpload.single("image"),
  validateCreateCategory,
  categoryController.createCategory
);

// Get all
router.get(
  "/",
  categoryController.getCategories
);

// Get single
router.get(
  "/:id",
  categoryController.getCategoryById
);

// Update
router.put(
  "/:id",
  categoryUpload.single("image"),
  validateUpdateCategory,
  categoryController.updateCategory
);

// Status toggle
router.patch(
  "/:id/status",
  categoryController.updateCategoryStatus
);

// Permanent delete
router.delete(
  "/:id",
  categoryController.deleteCategory
);

module.exports = router;