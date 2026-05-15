const express = require("express");
const router = express.Router();

const taxController = require("../controllers/tax.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/estimate", protect, taxController.estimateTax);
router.get("/calendar", protect, taxController.getTaxCalendar);

module.exports = router;
