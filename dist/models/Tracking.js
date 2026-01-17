"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TimelineSchema = new mongoose_1.Schema({
    date: { type: String, required: true },
    status: { type: String, required: true },
    location: { type: String, required: true },
    completed: { type: Boolean, default: false },
});
const TrackingSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Tracking", TrackingSchema);
