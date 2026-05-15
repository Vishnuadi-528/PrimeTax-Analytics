const Transaction = require("../models/transaction.model");

/**
 * Get Dashboard Summary
 * - Total income, total expense, net balance
 * - Last 5 transactions
 */
const getDashboardSummary = async (userId) => {
  const transactions = await Transaction.find({ user: userId }).sort({
    date: -1,
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.type === "income") {
      totalIncome += t.amount;
    } else if (t.type === "expense") {
      totalExpense += t.amount;
    }
  }

  const balance = totalIncome - totalExpense;

  const last5Transactions = transactions.slice(0, 5);

  return {
    totalIncome,
    totalExpense,
    balance,
    last5Transactions,
  };
};

module.exports = {
  getDashboardSummary,
};
