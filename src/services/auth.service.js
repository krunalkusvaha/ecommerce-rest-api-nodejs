const bcrypt = require("bcrypt");
const crypto = require("crypto");
const path = require("path");
const userRepository = require("../repositories/user.repository");
const userSessionRepository = require("../repositories/userSession.repository");
const {
  deleteFile,
} = require("../utils/file");

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/
const register = async ({
  name,
  email,
  password,
  phone,
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }
  const hashedPassword = await bcrypt.hash(password, 12);

  const userId = await userRepository.createUser({
    name: normalizedName,
    email: normalizedEmail,
    password: hashedPassword,
    phone: phone ? phone.trim() : null,
  });
  const user = await userRepository.findById(userId);
  return user;
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/
const login = async ({
  email,
  password,
  deviceName,
  deviceType,
  ipAddress,
  userAgent,
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "active") {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }
  const passwordMatched = await bcrypt.compare(password, user.password);

  if (!passwordMatched) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await userSessionRepository.createSession({
    userId: user.id,
    tokenHash,
    deviceName,
    deviceType,
    ipAddress,
    userAgent,
    expiresAt,
  });

  delete user.password;

  return {
    token,
    expiresAt,
    user,
  };
};

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/
const updateProfile = async (userId, {
  name,
  email,
  phone,
  address,
  gender,
  profileImage,
}) => {
  const existingUser = await userRepository.findById(userId);

  if (!existingUser) {
    const error = new Error("User profile not found");
    error.statusCode = 404;
    /*
      * Delete newly uploaded image
      * if user no longer exists.
      */
    if (profileImage) {
      deleteFile(path.join("profiles", profileImage));
    }
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Prepare Updated Values
  |--------------------------------------------------------------------------
  */
  const updatedName = name !== undefined ? name.trim() : existingUser.name;
  const updatedEmail = email !== undefined ? email.trim().toLowerCase() : existingUser.email;
  const updatedPhone = phone !== undefined ? phone.trim() : existingUser.phone;
  const updatedAddress = address !== undefined ? address.trim() : existingUser.address;
  const updatedGender = gender !== undefined ? gender.toLowerCase() : existingUser.gender;
  const updatedImage = profileImage !== undefined ? profileImage : existingUser.profile_image;

  /*
  |--------------------------------------------------------------------------
  | Check Duplicate Email
  |--------------------------------------------------------------------------
  */
  if (updatedEmail !== existingUser.email) {
    const emailUser = await userRepository.findByEmailExceptUser(updatedEmail, userId);

    if (emailUser) {
      /*
        * New image was already uploaded.
        * Delete it because update will not continue.
        */
      if (profileImage) {
          deleteFile(path.join("profiles", profileImage));
      }
      const error = new Error("This email address is already registered with another account");
      error.statusCode = 409;
      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Update Database
  |--------------------------------------------------------------------------
  */
  try {
    await userRepository.updateProfile(userId, {
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
      address: updatedAddress,
      gender: updatedGender,
      profile_image: updatedImage,
    });
  } catch (error) {
    /*
      * Database update failed.
      * Remove newly uploaded image.
      */
    if (profileImage) {
      deleteFile(path.join("profiles", profileImage));
    }
    throw error;
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Old Profile Image
  |--------------------------------------------------------------------------
  */
  if (profileImage !== undefined && existingUser.profile_image && existingUser.profile_image !== profileImage) {
    deleteFile(path.join("profiles", existingUser.profile_image));
  }

  /*
  |--------------------------------------------------------------------------
  | Return Updated User
  |--------------------------------------------------------------------------
  */
  return await userRepository.findById(userId);
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/
const logout = async (sessionId) => {
  const revoked = await userSessionRepository.revokeSession(sessionId);
  
  if (!revoked) {
    const error = new Error("Session could not be revoked");
    error.statusCode = 400;
    throw error;
  }
  return true;
};

module.exports = {
  register,
  login,
  updateProfile,
  logout,
};