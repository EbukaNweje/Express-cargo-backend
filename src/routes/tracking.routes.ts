import { Router } from "express"
import {
  createTracking,
  getAllTrackings,
  getTracking,
  updateTracking,
  deleteTracking,
} from "../controllers/tracking.controller"

const router = Router()

router.post("/", createTracking)
router.get("/", getAllTrackings)
router.get("/:id", getTracking)
router.put("/:id", updateTracking)
router.delete("/:id", deleteTracking)

export default router
