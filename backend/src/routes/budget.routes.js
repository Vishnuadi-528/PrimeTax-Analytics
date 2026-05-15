const express = require("express");
const router = express.Router();

const budgetController = require("../controllers/budget.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/", protect, budgetController.createBudget);
router.get("/", protect, budgetController.getBudgets);
router.get("/progress", protect, budgetController.getBudgetProgress);

module.exports = router;
