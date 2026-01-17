"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTracking = exports.updateTracking = exports.getTracking = exports.getAllTrackings = exports.createTracking = void 0;
const Tracking_1 = __importDefault(require("../models/Tracking"));
// CREATE
const createTracking = async (req, res) => {
    const tracking = await Tracking_1.default.create(req.body);
    res.status(201).json(tracking);
};
exports.createTracking = createTracking;
// GET ALL
const getAllTrackings = async (_, res) => {
    const trackings = await Tracking_1.default.find().sort({ createdAt: -1 });
    res.json(trackings);
};
exports.getAllTrackings = getAllTrackings;
// GET ONE
const getTracking = async (req, res) => {
    const tracking = await Tracking_1.default.findById(req.params.id);
    if (!tracking)
        return res.status(404).json({ message: "Not found" });
    res.json(tracking);
};
exports.getTracking = getTracking;
// UPDATE
const updateTracking = async (req, res) => {
    const tracking = await Tracking_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tracking);
};
exports.updateTracking = updateTracking;
// DELETE with id
const deleteTracking = async (req, res) => {
    await Tracking_1.default.findByIdAndDelete(req.params.id);
    res.json({ message: "Tracking deleted" });
};
exports.deleteTracking = deleteTracking;
