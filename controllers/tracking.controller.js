const Tracking = require("../models/Tracking");

exports.createTracking = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const tracking = await Tracking.create(req.body);
    res.status(201).json({
      success: true,
      message: "Tracking created successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error creating tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating tracking",
      error: error.message,
    });
  }
};

exports.getAllTrackings = async (req, res) => {
  try {
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
