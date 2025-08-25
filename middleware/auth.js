import jwt from "jsonwebtoken";

/**
 * Middleware: auth
 * --------------------------------
 * This middleware checks if the user is authenticated.
 * It verifies the JWT token from either cookies or the Authorization header.
 * If valid, it attaches the user ID to `req.userId` and allows the request to continue.
 * Otherwise, it responds with an error.
 */
const auth = async (req, res, next) => {
  try {
    // Get token from cookies OR Authorization header (Bearer token)
    const token =
      req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

    // If no token found, reject the request
    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
        error: true,
        success: false,
      });
    }

    // Verify token with secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    // Attach user ID from token payload to the request object
    req.userId = decoded.id;

    // Continue to the next middleware/controller
    next();
  } catch (error) {
    // Handle token errors (expired, invalid, etc.)
    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Token has expired. Please login again."
          : "Invalid token. Unauthorized access.",
      error: true,
      success: false,
    });
  }
};

export default auth;
