const Tracking = require("../models/Tracking");

exports.createTracking = async (req, res) => {
  const tracking = await Tracking.create(req.body);
  res.status(201).json(tracking);
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
  const tracking = await Tracking.findById(req.params.id);
  if (!tracking) return res.status(404).json({ message: "Not found" });
  res.json(tracking);
};

exports.updateTracking = async (req, res) => {
  const tracking = await Tracking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(tracking);
};

exports.deleteTracking = async (req, res) => {
  await Tracking.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
