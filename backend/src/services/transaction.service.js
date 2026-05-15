const Transaction = require("../models/transaction.model");
const mongoose = require("mongoose");

/**
 * Create Transaction
 */
const createTransaction = async (userId, data) => {
  const { type, amount, category, date } = data;

  // Extra validation (schema already enforces enum)
  if (!["income", "expense"].includes(type)) {
    const error = new Error("Invalid transaction type");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.create({
    user: userId,
    type,
    amount,
    category,
    date,
  });

  return transaction;
};

/**
 * Get All Transactions for Logged-in User
 */
const getTransactions = async (userId) => {
  const transactions = await Transaction.find({ user: userId }).sort({
    date: -1,
  });

  return transactions;
};

/**
 * Update Transaction
 */
const updateTransaction = async (userId, transactionId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  // Ownership check
  if (transaction.user.toString() !== userId) {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    throw error;
  }

  // Allow only specific fields to update
  const allowedFields = ["type", "amount", "category", "date"];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      transaction[field] = updateData[field];
    }
  });

  await transaction.save();

  return transaction;
};

/**
 * Delete Transaction
 */
const deleteTransaction = async (userId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    const error = new Error("Invalid transaction ID");
    error.statusCode = 400;
    throw error;
  }

  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  // Ownership check
  if (transaction.user.toString() !== userId) {
    const error = new Error("Unauthorized access");
    error.statusCode = 403;
    throw error;
  }

  await transaction.deleteOne();

  return { message: "Transaction deleted successfully" };
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
