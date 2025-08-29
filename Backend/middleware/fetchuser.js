const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/Users"); // Import the User model

// This middleware fetches the user from the database based on the JWT token.
const fetchuser = async (req, res, next) => {
  try {
    // Check for the "Authorization" header, which is standard practice.
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Please Authenticate using correct Credentials",
      });
    }

    // The header format is "Bearer <token>", so we split it to get the token.
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token format is invalid",
      });
    }

    // Verify the token using the secret key.
    const data = jwt.verify(token, process.env.JWT_SECRET || "hexa");

    // The token payload contains the user's ID, which we attach to the request.
    // This allows subsequent route handlers to know which user is making the request.
    req.user = data.user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(401).json({
      success: false,
      message: "Please Authenticate using a valid token",
    });
  }
};

console.log("JWT_SECRET used in middleware:", process.env.JWT_SECRET);

module.exports = fetchuser;
