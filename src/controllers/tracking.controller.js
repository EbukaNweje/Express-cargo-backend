const Tracking = require("../models/Tracking");

exports.createTracking = async (req, res) => {
  const tracking = await Tracking.create(req.body);
  res.status(201).json(tracking);
};

exports.getAllTrackings = async (_, res) => {
  const trackings = await Tracking.find().sort({ createdAt: -1 });
  res.json(trackings);
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
