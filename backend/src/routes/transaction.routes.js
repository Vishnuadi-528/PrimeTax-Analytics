const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transaction.controller");
const protect = require("../middlewares/auth.middleware");

// POST /transactions
router.post("/", protect, transactionController.createTransaction);

// GET /transactions
router.get("/", protect, transactionController.getTransactions);

// PUT /transactions/:id
router.put("/:id", protect, transactionController.updateTransaction);

// DELETE /transactions/:id
router.delete("/:id", protect, transactionController.deleteTransaction);

module.exports = router;
