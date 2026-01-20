const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables for controller
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, "../config/index.env") });
} else {
  dotenv.config();
}

exports.createAdmin = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, fullName, password: hashedPassword });
    await admin.save();
    res
      .status(201)
      .json({ message: "Admin created successfully", data: admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    console.log("=== DEBUG INFO ===");
    console.log("Current working directory:", process.cwd());
    console.log("__dirname:", __dirname);
    console.log("All env vars:", Object.keys(process.env));
    console.log("JWT from env:", process.env.JWT);
    console.log("JWT type:", typeof process.env.JWT);
    console.log("JWT length:", process.env.JWT ? process.env.JWT.length : 0);
    console.log("==================");

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Use a hardcoded secret for now to test
    const jwtSecret = process.env.JWT || "Availtrade_fallback_secret_key_2024";

    console.log("Using JWT secret:", jwtSecret);
    console.log("Secret length:", jwtSecret.length);

    const token = jwt.sign({ id: admin._id, super: admin.super }, jwtSecret, {
      expiresIn: "1d",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.testJWT = async (req, res) => {
  try {
    console.log("=== JWT TEST ===");
    console.log("process.env.JWT:", process.env.JWT);
    console.log("JWT type:", typeof process.env.JWT);

    const testSecret = process.env.JWT || "fallback_secret";
    console.log("Using secret:", testSecret);

    const testToken = jwt.sign({ test: "data" }, testSecret, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "JWT test successful",
      secret: testSecret,
      token: testToken,
    });
  } catch (error) {
    console.error("JWT test error:", error);
    res.status(500).json({
      message: "JWT test failed",
      error: error.message,
      secret: process.env.JWT,
    });
  }
};
