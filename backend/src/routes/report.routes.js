const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const protect = require("../middlewares/auth.middleware");

router.get("/monthly", protect, reportController.getMonthlyReport);
router.get("/quarterly", protect, reportController.getQuarterlyReport);
router.get("/export-csv", protect, reportController.exportCsv);
router.get("/export-pdf", protect, reportController.exportPdf);

module.exports = router;
