import bcrypt from "bcryptjs";
import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";

/**
 * Controller: registerUserController
 * ----------------------------------
 * Registers a new user by validating input, checking duplicates, hashing password,
 * saving user, sending verification email, and returning a response.
 */
export async function registerUserController(req, res) {
  try {
    // Destructure the request body safely
    const { name, email, password } = req.body || {};

    // Check if any required field is missing
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Provide name, email and password",
        error: true,
        success: false,
      });
    }

    // Check if a user with the given email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
        error: true,
        success: false,
      });
    }

    // Generate a salt and hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword, // store hashed password
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Generate a verification URL for email confirmation
    const verifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser._id}`;

    // Send the verification email using the template
    await sendEmail({
      sendTo: email,
      subject: "Blinkeyit User Verification Email!",
      html: verifyEmailTemplate({ name, url: verifyEmailUrl }),
    });

    // Exclude password from response before sending back to client
    // const { password: _, ...userData } = savedUser.toObject();

    // Return success response
    return res.status(201).json({
      message: "User registration successful! Please verify your email.",
      error: false,
      success: true,
      data: savedUser,
    });
  } catch (error) {
    // Handle server errors
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

/**
 * Controller: verifyEmailController
 * ----------------------------------
 * This controller verifies a user's email based on a unique code (usually user ID or token).
 * It checks if the user exists, updates their verification status, and returns the response.
 */
export async function verifyEmailController(req, res) {
  try {
    // Extract the verification code (should ideally be a token, but here it's using user _id)
    const { code } = req.body;

    // Find user by provided code
    const user = await UserModel.findById(code);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code.",
        error: true,
        success: false,
      });
    }

    // If user is already verified, prevent duplicate verification
    if (user.verify_email) {
      return res.status(200).json({
        message: "Email is already verified.",
        success: true,
        error: false,
      });
    }

    // Update user's email verification status
    await UserModel.updateOne({ _id: code }, { verify_email: true });

    return res.status(200).json({
      message: "Email verification successful!",
      success: true,
      error: false,
    });
  } catch (error) {
    // Catch and handle unexpected server errors
    return res.status(500).json({
      message: error.message || "Server error during email verification.",
      error: true,
      success: false,
    });
  }
}

/**
 * Controller: loginController
 * ----------------------------------
 * This controller handles user login by validating credentials, checking account status,
 * generating access/refresh tokens, storing the refresh token in the database,
 * and setting cookies for secure authentication management.
 */
export async function loginController(req, res) {
  try {
    // Extract email and password from request body
    const { email, password } = req.body || {};

    // Check email and pasword is provided or not
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        error: true,
        success: false,
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not registered!",
        error: true,
        success: false,
      });
    }

    // Check if account is active
    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Account is inactive or suspended. Please contact Admin.",
        error: true,
        success: false,
      });
    }

    // Verify password
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Invalid password. Please try again.",
        error: true,
        success: false,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in DB
    await UserModel.updateOne(
      { _id: user._id },
      { refresh_token: refreshToken }
    );

    // Cookie options for secure storage
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    // Send tokens in cookies
    res.cookie("accessToken", accessToken, cookiesOption);
    res.cookie("refreshToken", refreshToken, cookiesOption);

    // Return success response
    return res.json({
      message: "Login successful!",
      error: false,
      success: true,
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    // Handle unexpected server errors
    return res.status(500).json({
      message: error.message || "Server error during login.",
      error: true,
      success: false,
    });
  }
}

/**
 * Controller: logoutController
 * ----------------------------------
 * Handles user logout by:
 * Clearing authentication cookies (access & refresh tokens).
 * Removing the refresh token from the database for the user.
 * Returning a success response.
 */
export async function logoutController(req, res) {
  try {
    // Ensure userId is available from auth middleware
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized. User ID missing.",
        error: true,
        success: false,
      });
    }

    // Cookie options (must match how they were originally set)
    const cookieOptions = {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: true, // Only over HTTPS (set false in local dev if needed)
      sameSite: "None", // Required for cross-site cookies
    };

    // Clear authentication cookies
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    // Remove refresh token from the database (invalidate session)
    const user = await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    // Send success response
    return res.json({
      message: "Logout successful.",
      error: false,
      success: true,
    });
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({
      message: error.message || "Internal server error.",
      error: true,
      success: false,
    });
  }
}

/**
 * Controller: uploadAvatar
 * ----------------------------------
 * This controller handles profile avatar uploads by verifying authentication,
 * validating the uploaded image, uploading it to Cloudinary (or other storage),
 * updating the user's avatar field in the database,
 * and returning the updated avatar information.
 */
export async function uploadAvatar(req, res) {
  try {
    // Ensure user is authenticated (userId injected by auth middleware)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        error: true,
        success: false,
      });
    }

    // Ensure file is provided (handled by multer middleware)
    const image = req.file;
    if (!image) {
      return res.status(400).json({
        message: "No image file uploaded",
        error: true,
        success: false,
      });
    }

    // Upload image to cloud storage (Cloudinary)
    const upload = await uploadImageCloudinary(image);

    // Update user's avatar in the database
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {
      avatar: upload.url,
    });

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Success response
    return res.json({
      message: "Profile avatar uploaded successfully",
      data: {
        _id: userId,
        avatar: upload.url,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    // Internal Server Error handler
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

/**
 * Controller: updateUserDetails
 * -----------------------------
 * Updates a user's profile information including name, email, mobile, and password,
 * ensures authentication, securely hashes the password if provided, and returns the updated user details
 */
export async function updateUserDetails(req, res) {
  try {
    // Verify authentication, userId is injected by authentication middleware
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
        error: true,
        success: false,
      });
    }

    // Extract fields from request body
    const { name, email, mobile, password } = req.body;

    // Hash password if provided
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Build dynamic update object only with provided fields
    const updateFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(mobile && { mobile }),
      ...(password && { password: hashedPassword }),
    };

    // Update user document and return the new version
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true } // returns updated doc and applies validation
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "User updated successfully",
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    // Generic internal error handler
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

