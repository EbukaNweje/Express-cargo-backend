const router = require("express").Router();
const controller = require("../controllers/shipment.controller");

// Public routes
router.post("/", controller.createShipment);
router.get("/track/:shipmentNumber", controller.getShipment);

// Admin routes (you might want to add authentication middleware)
router.get("/", controller.getAllShipments);
router.get("/:id", controller.getShipment);
router.put("/:id", controller.updateShipment);
router.delete("/:id", controller.deleteShipment);
router.patch("/:id/status", controller.updateShipmentStatus);

module.exports = router;
