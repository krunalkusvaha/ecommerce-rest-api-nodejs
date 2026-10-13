const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Upload Directories
|--------------------------------------------------------------------------
*/

const categoryUploadPath =
  path.join(
    process.cwd(),
    "uploads",
    "categories"
  );

const profileUploadPath =
  path.join(
    process.cwd(),
    "uploads",
    "profiles"
  );

/*
|--------------------------------------------------------------------------
| Create Directories
|--------------------------------------------------------------------------
*/

if (!fs.existsSync(categoryUploadPath)) {
  fs.mkdirSync(
    categoryUploadPath,
    {
      recursive: true,
    }
  );
}

if (!fs.existsSync(profileUploadPath)) {
  fs.mkdirSync(
    profileUploadPath,
    {
      recursive: true,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Allowed Images
|--------------------------------------------------------------------------
*/

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

/*
|--------------------------------------------------------------------------
| Category Storage
|--------------------------------------------------------------------------
*/

const categoryStorage =
  multer.diskStorage({
    destination: (req, file, cb ) => { 
      cb(null, categoryUploadPath);
    },

    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();

      const randomName = crypto.randomBytes(16).toString("hex");

      cb(null, `category-${Date.now()}-${randomName}${extension}`);
    },
  });

/*
|--------------------------------------------------------------------------
| Profile Storage
|--------------------------------------------------------------------------
*/

const profileStorage =
  multer.diskStorage({destination: (req, file, cb) => {
      cb(null, profileUploadPath);
    },

    filename: (req, file, cb ) => {
      const extension = path.extname(file.originalname).toLowerCase();

      const randomName = crypto.randomBytes(16).toString("hex");

      cb(null, `profile-${Date.now()}-${randomName}${extension}`);
    },
  });

/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
*/

const fileFilter = (req, file, cb ) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
    return cb(null, true);
  }

  const error = new Error(
    "Only JPG, JPEG, PNG, WEBP and GIF images are allowed"
  );

  error.statusCode = 422;

  return cb(error);
};

/*
|--------------------------------------------------------------------------
| Category Upload
|--------------------------------------------------------------------------
*/

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/*
|--------------------------------------------------------------------------
| Profile Upload
|--------------------------------------------------------------------------
*/

const profileUpload = multer({
  storage: profileStorage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  categoryUpload,
  profileUpload,
};