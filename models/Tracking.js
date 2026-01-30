const { Schema, model } = require("mongoose");

const TimelineSchema = new Schema({
  date: { type: Date, required: true },
  status: { type: String, required: true },
  location: { type: String },
  completed: { type: Boolean, default: false },
});

const TrackingSchema = new Schema(
  {
    trackingNumber: { type: String, unique: true, required: true },

    // Location & Delivery
    currentLocation: { type: String },
    deliveryLocation: { type: String },
    estimatedDelivery: { type: Date },

    // Status & Progress
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered"],
      default: "Pending",
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },

    // Parties
    sender: {
      name: { type: String },
      email: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
    },
    receiver: {
      name: { type: String },
      email: {
        type: String,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
      phone: { type: String },
    },

    // Shipment/Product details
    productName: { type: String },
    typeOfShipment: { type: String },
    weight: { type: Number, min: 0 },
    quantity: { type: Number, min: 0 },
    totalFreight: { type: Number, min: 0, default: 0 },

    // Timeline events
    events: { type: [TimelineSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Generate a tracking number if not provided (run before validation so required validator is satisfied)
TrackingSchema.pre("validate", async function (next) {
  if (!this.trackingNumber) {
    const count = await this.constructor.countDocuments();
    this.trackingNumber = `ECSL${Date.now()}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = model("Tracking", TrackingSchema);
