const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const {successResponse, } = require("../utils/response");

/*
|--------------------------------------------------------------------------
| Profile Image URL
|--------------------------------------------------------------------------
*/
const getProfileImageUrl = (req, filename) => {
  if (!filename) {
    return null;
  }
  return `${req.protocol}://${req.get("host")}/uploads/profiles/${filename}`;
};

/*
|--------------------------------------------------------------------------
| Format User
|--------------------------------------------------------------------------
*/
const formatUser = (req, user) => {
  if (!user) {
    return user;
  }
  return {
    ...user,  profile_image: getProfileImageUrl(req, user.profile_image),
  };
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/
const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
  } = req.body;

  const user = await authService.register({
    name,
    email,
    password,
    phone,
  });

  return successResponse(res, formatUser(req, user), "Registration successful", 201);
});

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
const login = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    device_name,
    device_type,
  } = req.body;

  const result = await authService.login({
    email,
    password,
    deviceName: device_name,
    deviceType: device_type,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });
  
  result.user = formatUser(req, result.user);
  return successResponse(res, result, "Login successful");
});

/*
|--------------------------------------------------------------------------
| Get Logged-in User
|--------------------------------------------------------------------------
*/
const me = asyncHandler(async (req, res) => {
  return successResponse(res, formatUser(req, req.user), "User profile fetched successfully");
});

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/
const updateProfile = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    gender,
  } = req.body;

  const profileImage = req.file ? req.file.filename : undefined;
  const user = await authService.updateProfile(req.user.id, {
    name,
    email,
    phone,
    address,
    gender,
    profileImage,
  });
  return successResponse(res, formatUser(req, user), "User profile updated successfully");
});

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.session.id);
  return successResponse(res, null, "Logout successful");
});

module.exports = {
  register,
  login,
  me,
  updateProfile,
  logout,
};