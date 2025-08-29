import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users.js"; // Import the User model
import sendMail from "../utils/sendMail.js"; // Import the sendMail utility

const router = express.Router();

// Temporary OTP store (in production use DB/Redis)
const otpStore = new Map();

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    // Check if the user exists

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, otp);

    // TODO: Actually send the email using the sendMail utility
    const emailSent = await sendMail(email, "Your OTP", `Your One-Time Password is: ${otp}`);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }

    console.log(`OTP for ${email}: ${otp}`);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in send-otp:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user to get their ID
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate OTP
    if (!otpStore.has(email) || otpStore.get(email) !== otp) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP after use
    otpStore.delete(email);

    // Generate JWT with the user's ID
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "hexa", {
      expiresIn: "1h",
    });

    res.json({ success: true, authToken: token, message: "Login successful" });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/signup", async (req, res) => {
  const { email, fullName, dob, otp } = req.body;

  try {
    // Validate OTP
    if (!otpStore.has(email) || otpStore.get(email) !== otp) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP after use
    otpStore.delete(email);

    const user = await User.create({
      fullName: fullName,
      email: email,
      dob: dob,
      isVerified: true
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not created" });
    }

    // Generate JWT with the user's ID
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "hexa", {
      expiresIn: "1h",
    });

    res.json({ success: true, authToken: token, message: "Signup successful" });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
})

export default router;