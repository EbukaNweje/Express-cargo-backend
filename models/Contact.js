const { Schema, model } = require("mongoose");

const ContactSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: true,
    },
    preferredContactMethod: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "closed"],
      default: "new",
    },
  },
  { timestamps: true },
);

module.exports = model("Contact", ContactSchema);
