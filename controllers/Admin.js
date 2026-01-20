const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, super: admin.super },
      process.env.JWT,
      {
        expiresIn: "1d",
      },
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
