const { Schema, model } = require("mongoose");

const TimelineSchema = new Schema({
  date: String,
  status: String,
  location: String,
  completed: Boolean,
});

const TrackingSchema = new Schema(
  {
    trackingNumber: { type: String, unique: true, required: true },
    currentLocation: String,
    estimatedDelivery: String,
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered"],
      default: "Pending",
    },
    progress: Number,
    events: [TimelineSchema],
  },
  { timestamps: true },
);

module.exports = model("Tracking", TrackingSchema);
