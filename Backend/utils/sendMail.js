// backend/utils/sendMail.js
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

/**
 * Send an email using Gmail SMTP via Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @returns {Promise<boolean>} Returns true if email sent successfully, false otherwise
 */
const sendMail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS is not defined in .env");
    }

    // Create Gmail transporter using App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail email
        pass: process.env.EMAIL_PASS, // **16-character App Password**
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = sendMail;
