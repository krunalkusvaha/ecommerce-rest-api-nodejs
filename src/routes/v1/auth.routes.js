const express = require("express");
const authController = require("../../controllers/auth.controller");
const {validateRegister, validateLogin, validateUpdateProfile, } = require("../../validations/auth.validation");
const authMiddleware = require("../../middlewares/auth.middleware");
const { profileUpload, } = require("../../middlewares/upload.middleware");
const router = express.Router();

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/
router.post("/register", validateRegister, authController.register);

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
router.post("/login", validateLogin, authController.login);

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/
router.get("/me", authMiddleware, authController.me);

/*
|--------------------------------------------------------------------------
| Update Current User Profile
|--------------------------------------------------------------------------
*/
router.put("/me", authMiddleware, profileUpload.single("image"), validateUpdateProfile, authController.updateProfile);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/
router.post("/logout", authMiddleware, authController.logout);
module.exports = router;