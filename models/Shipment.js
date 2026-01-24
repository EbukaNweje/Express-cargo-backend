const { Schema, model } = require("mongoose");

const ShipmentSchema = new Schema(
  {
    // Shipment Details
    origin: {
      type: String,
      required: [true, "Origin is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0.1, "Weight must be greater than 0"],
    },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    preferredShipDate: {
      type: Date,
      required: [true, "Preferred ship date is required"],
    },
    cargoType: {
      type: String,
      required: [true, "Cargo type is required"],
      enum: [
        "General Cargo",
        "Fragile Items",
        "Electronics",
        "Documents",
        "Perishables",
        "Hazardous Materials",
        "Automotive Parts",
        "Textiles",
        "Machinery",
        "Other",
      ],
    },

    // Contact Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    // System fields
    shipmentNumber: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for formatted dimensions
ShipmentSchema.virtual("formattedDimensions").get(function () {
  return `${this.dimensions.length}x${this.dimensions.width}x${this.dimensions.height} cm`;
});

// Pre-save middleware to generate shipment number
ShipmentSchema.pre("save", async function (next) {
  if (!this.shipmentNumber) {
    const count = await this.constructor.countDocuments();
    this.shipmentNumber = `SHP${Date.now()}${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

module.exports = model("Shipment", ShipmentSchema);
