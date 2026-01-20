const Tracking = require("../models/Tracking");
const mongoose = require("mongoose");

// Ensure connection before operations
const ensureConnection = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.DATABASE, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
    });
  }
};

exports.createTracking = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      trackingNumber,
      currentLocation,
      estimatedDelivery,
      status,
      progress,
      events,
    } = req.body;

    // Validate required fields
    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required",
      });
    }

    if (!currentLocation) {
      return res.status(400).json({
        success: false,
        message: "Current location is required",
      });
    }

    if (!estimatedDelivery) {
      return res.status(400).json({
        success: false,
        message: "Estimated delivery date is required",
      });
    }

    // Validate status enum
    const validStatuses = ["Pending", "In Transit", "Delivered"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Validate progress is a number between 0-100
    if (progress !== undefined) {
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be a number between 0 and 100",
        });
      }
    }

    // Validate events array structure if provided
    if (events && Array.isArray(events)) {
      for (const event of events) {
        if (!event.date || !event.status || !event.location) {
          return res.status(400).json({
            success: false,
            message: "Each event must have date, status, and location",
          });
        }
      }
    }

    // Create tracking with validated data
    const trackingData = {
      trackingNumber,
      currentLocation,
      estimatedDelivery,
      status: status || "Pending",
      progress: progress || 0,
      events: events || [],
    };

    const tracking = await Tracking.create(trackingData);

    res.status(201).json({
      success: true,
      message: "Tracking created successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error creating tracking:", error);

    // Handle duplicate tracking number error
    if (error.code === 11000 && error.keyPattern.trackingNumber) {
      return res.status(409).json({
        success: false,
        message: "Tracking number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating tracking",
      error: error.message,
    });
  }
};

exports.getAllTrackings = async (req, res) => {
  try {
    await ensureConnection();
    const trackings = await Tracking.find();
    res.status(200).json({
      success: true,
      data: trackings,
      count: trackings.length,
    });
  } catch (error) {
    console.error("Error fetching trackings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trackings",
      error: error.message,
    });
  }
};

exports.getTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findById(req.params.id);
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }
    res.status(200).json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    console.error("Error fetching tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tracking",
      error: error.message,
    });
  }
};

exports.updateTracking = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }
    const tracking = await Tracking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tracking updated successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error updating tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error updating tracking",
      error: error.message,
    });
  }
};

exports.deleteTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findByIdAndDelete(req.params.id);
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tracking deleted successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error deleting tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting tracking",
      error: error.message,
    });
  }
};
