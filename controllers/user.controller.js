import bcrypt from "bcryptjs";
import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
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
