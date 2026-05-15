const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const protect = require("../middlewares/auth.middleware");

// GET /dashboard/summary
router.get("/summary", protect, dashboardController.getSummary);

module.exports = router;
