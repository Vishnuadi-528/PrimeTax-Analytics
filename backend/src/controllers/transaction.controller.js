const { successResponse } = require("../utils/response");
const transactionService = require("../services/transaction.service");

/**
 * POST /transactions
 */
exports.createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { type, amount, category, date } = req.body;

    if (!type || !amount || !category || !date) {
      const error = new Error(
        "All fields (type, amount, category, date) are required",
      );
      error.statusCode = 400;
      throw error;
    }

    const transaction = await transactionService.createTransaction(userId, {
      type,
      amount,
      category,
      date,
    });

    successResponse(res, transaction, "Transaction created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /transactions
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await transactionService.getTransactions(userId);

    successResponse(res, transactions, "Transactions fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /transactions/:id
 */
exports.updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const updatedTransaction = await transactionService.updateTransaction(
      userId,
      transactionId,
      req.body,
    );

    successResponse(
      res,
      updatedTransaction,
      "Transaction updated successfully",
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /transactions/:id
 */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    await transactionService.deleteTransaction(userId, transactionId);

    successResponse(res, null, "Transaction deleted successfully");
  } catch (error) {
    next(error);
  }
};
