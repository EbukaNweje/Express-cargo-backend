const router = require("express").Router();
const controller = require("../controllers/tracking.controller");

router.post("/", controller.createTracking);
router.get("/getalltracking", controller.getAllTrackings);
router.get("/:trackingNumber", controller.getTracking);
router.put("/:id", controller.updateTracking);
router.delete("/:id", controller.deleteTracking);

module.exports = router;
