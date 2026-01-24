const router = require("express").Router();
const controller = require("../controllers/contact.controller");

router.post("/", controller.createContact);
router.get("/getallcontacts", controller.getAllContacts);
router.get("/:id", controller.getContact);
router.put("/:id", controller.updateContact);
router.patch("/:id/status", controller.updateContactStatus);
router.delete("/:id", controller.deleteContact);

module.exports = router;
