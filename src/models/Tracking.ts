import { Schema, model } from "mongoose"

const TimelineSchema = new Schema({
  date: { type: String, required: true },
  status: { type: String, required: true },
  location: { type: String, required: true },
  completed: { type: Boolean, default: false },
})

const TrackingSchema = new Schema(
  {
    trackingNumber: { type: String, required: true, unique: true },
    currentLocation: { type: String, required: true },
    estimatedDelivery: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered"],
      default: "Pending",
    },
    progress: { type: Number, default: 0 },
    events: [TimelineSchema],
  },
  { timestamps: true }
)

export default model("Tracking", TrackingSchema)
