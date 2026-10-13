const validateCreateCategory = (req, res, next) => {
  const {
    name,
    slug,
    description,
    sort_order,
  } = req.body;

  const errors = {};

  if (!name || !name.trim()) {
    errors.name = "Category name is required";
  } else if (name.trim().length > 100) {
    errors.name =
      "Category name must not exceed 100 characters";
  }

  if (!slug || !slug.trim()) {
    errors.slug = "Category slug is required";
  } else if (slug.trim().length > 120) {
    errors.slug =
      "Category slug must not exceed 120 characters";
  } else if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug.trim()
    )
  ) {
    errors.slug =
      "Slug must contain only lowercase letters, numbers and hyphens";
  }

  if (sort_order !== undefined) {
    const sortOrder = Number(sort_order);

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      errors.sort_order =
        "Sort order must be a non-negative integer";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateUpdateCategory = (req, res, next) => {
  const {
    name,
    slug,
    description,
    sort_order,
  } = req.body;

  const errors = {};

  if (name !== undefined) {
    if (!name.trim()) {
      errors.name =
        "Category name cannot be empty";
    } else if (name.trim().length > 100) {
      errors.name =
        "Category name must not exceed 100 characters";
    }
  }

  if (slug !== undefined) {
    if (!slug.trim()) {
      errors.slug =
        "Category slug cannot be empty";
    } else if (slug.trim().length > 120) {
      errors.slug =
        "Category slug must not exceed 120 characters";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        slug.trim()
      )
    ) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers and hyphens";
    }
  }

  if (sort_order !== undefined) {
    const sortOrder = Number(sort_order);

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      errors.sort_order =
        "Sort order must be a non-negative integer";
    }
  }

  // Status must NOT be updated from normal update API.
  if (statusIsProvided(req.body)) {
    errors.status =
      "Status can only be changed using the status API";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const statusIsProvided = (body) => {
  return Object.prototype.hasOwnProperty.call(
    body,
    "status"
  );
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
};