import bcrypt from "bcryptjs";
import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";

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
