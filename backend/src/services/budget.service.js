const Budget = require("../models/budget.model");
const Transaction = require("../models/transaction.model");

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Parse month string "February 2026" to start and end dates
 */
const parseMonthToDateRange = (monthStr) => {
  const parts = monthStr.trim().split(" ");
  const monthName = parts[0];
  const year = parseInt(parts[1], 10);

  const monthIndex = MONTH_NAMES.indexOf(monthName);
  if (monthIndex === -1 || isNaN(year)) {
    const error = new Error("Invalid month format. Use 'Month Year' e.g. 'February 2026'");
    error.statusCode = 400;
    throw error;
  }

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  return { startDate, endDate };
};

/**
 * Create Budget
 */
const createBudget = async (userId, data) => {
  const { category, limit, month } = data;

  if (!category || limit === undefined || !month) {
    const error = new Error("category, limit, and month are required");
    error.statusCode = 400;
    throw error;
  }

  const budget = await Budget.create({
    user_id: userId,
    category: category.trim(),
    limit: Number(limit),
    month: month.trim(),
  });

  return budget;
};

/**
 * Get all budgets for user
 */
const getBudgetsByUser = async (userId) => {
  const budgets = await Budget.find({ user_id: userId }).sort({
    month: -1,
    category: 1,
  });

  return budgets;
};

/**
 * Calculate budget progress for a given month
 */
const calculateBudgetProgress = async (userId, month) => {
  if (!month) {
    const error = new Error("month query parameter is required");
    error.statusCode = 400;
    throw error;
  }

  const { startDate, endDate } = parseMonthToDateRange(month);

  const budgets = await Budget.find({
    user_id: userId,
    month: month.trim(),
  });

  const expenses = await Transaction.find({
    user: userId,
    type: "expense",
    date: { $gte: startDate, $lte: endDate },
  });

  const spentByCategory = expenses.reduce((acc, t) => {
    const cat = (t.category || "").trim();
    if (cat) {
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  const result = [];

  for (let i = 0; i < budgets.length; i++) {
    const budget = budgets[i];
    const category = budget.category;
    const limit = Number(budget.limit);
    const spent = spentByCategory[category] || 0;
    const remaining = limit - spent;

    let status = "Good";
    const percentUsed = limit > 0 ? (spent / limit) * 100 : 0;

    if (spent > limit) {
      status = "Over";
    } else if (percentUsed >= 80 && percentUsed <= 100) {
      status = "Warning";
    } else if (percentUsed < 80) {
      status = "Good";
    }

    result.push({
      category,
      limit,
      spent,
      remaining,
      status,
    });
  }

  return result;
};

module.exports = {
  createBudget,
  getBudgetsByUser,
  calculateBudgetProgress,
};
