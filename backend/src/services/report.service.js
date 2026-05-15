const Transaction = require("../models/transaction.model");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Get date range for a month (1-indexed: 1=Jan, 2=Feb, ...)
 */
const getMonthDateRange = (month, year) => {
  const monthNum = Number(month);
  const yearNum = Number(year);
  if (monthNum < 1 || monthNum > 12) {
    const error = new Error("Invalid month. Use 1-12");
    error.statusCode = 400;
    throw error;
  }
  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Get date range for a quarter
 */
const getQuarterDateRange = (quarter, year) => {
  const quarterMap = {
    Q1: { startMonth: 0, endMonth: 2 },
    Q2: { startMonth: 3, endMonth: 5 },
    Q3: { startMonth: 6, endMonth: 8 },
    Q4: { startMonth: 9, endMonth: 11 },
  };
  const range = quarterMap[quarter];
  if (!range) {
    const error = new Error("Invalid quarter. Use Q1, Q2, Q3, or Q4");
    error.statusCode = 400;
    throw error;
  }
  const yearNum = Number(year);
  const startDate = new Date(yearNum, range.startMonth, 1);
  const endDate = new Date(yearNum, range.endMonth + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Generate monthly report
 */
const generateMonthlyReport = async (userId, month, year) => {
  const { startDate, endDate } = getMonthDateRange(month, year);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.type === "income") {
      totalIncome += Number(t.amount);
    } else if (t.type === "expense") {
      totalExpense += Number(t.amount);
    }
  }

  const netProfit = totalIncome - totalExpense;
  const period = `${MONTH_NAMES[Number(month) - 1]} ${year}`;

  const transactionsList = transactions.map((t) => ({
    type: t.type,
    category: t.category,
    amount: t.amount,
    date: t.date,
  }));

  return {
    period,
    totalIncome,
    totalExpense,
    netProfit,
    transactions: transactionsList,
  };
};

/**
 * Generate quarterly report
 */
const generateQuarterlyReport = async (userId, quarter, year) => {
  const { startDate, endDate } = getQuarterDateRange(quarter, year);

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  let totalIncome = 0;
  let totalExpense = 0;

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.type === "income") {
      totalIncome += Number(t.amount);
    } else if (t.type === "expense") {
      totalExpense += Number(t.amount);
    }
  }

  const netProfit = totalIncome - totalExpense;
  const period = `${quarter} ${year}`;

  const transactionsList = transactions.map((t) => ({
    type: t.type,
    category: t.category,
    amount: t.amount,
    date: t.date,
  }));

  return {
    period,
    totalIncome,
    totalExpense,
    netProfit,
    transactions: transactionsList,
  };
};

module.exports = {
  generateMonthlyReport,
  generateQuarterlyReport,
};
