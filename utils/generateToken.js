import jwt from "jsonwebtoken";

/**
 * Utility: generateAccessToken
 * ----------------------------
 * Generates a short-lived JWT access token.
 * @param {string} userId - The unique user ID from MongoDB (_id).
 * @returns {string} Signed JWT access token.
 */
export const generateAccessToken = (userId) => {
  if (!process.env.SECRET_KEY_ACCESS_TOKEN) {
    throw new Error("SECRET_KEY_ACCESS_TOKEN is not defined in .env file");
  }

  // Create access token (default: 5 hours expiry)
  return jwt.sign({ id: userId }, process.env.SECRET_KEY_ACCESS_TOKEN, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "5h",
  });
};

/**
 * Utility: generateRefreshToken
 * -----------------------------
 * Generates a refresh token (JWT) for a given user.
 * @param {string} userId - The unique user ID.
 * @returns {string} Signed JWT refresh token.
 */
export const generateRefreshToken = (userId) => {
  if (!process.env.SECRET_KEY_REFRESH_TOKEN) {
    throw new Error("SECRET_KEY_REFRESH_TOKEN is not defined in .env file");
  }

  // Create refresh token (default: 7 days expiry)
  return jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};
