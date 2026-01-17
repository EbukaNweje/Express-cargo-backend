import { Request, Response } from "express"
import Tracking from "../models/Tracking"

// CREATE
export const createTracking = async (req: Request, res: Response) => {
  const tracking = await Tracking.create(req.body)
  res.status(201).json(tracking)
}

// GET ALL
export const getAllTrackings = async (_: Request, res: Response) => {
  const trackings = await Tracking.find().sort({ createdAt: -1 })
  res.json(trackings)
}

// GET ONE
export const getTracking = async (req: Request, res: Response) => {
  const tracking = await Tracking.findById(req.params.id)
  if (!tracking) return res.status(404).json({ message: "Not found" })
  res.json(tracking)
}

// UPDATE
export const updateTracking = async (req: Request, res: Response) => {
  const tracking = await Tracking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.json(tracking)
}

// DELETE
export const deleteTracking = async (req: Request, res: Response) => {
  await Tracking.findByIdAndDelete(req.params.id)
  res.json({ message: "Tracking deleted" })
}
