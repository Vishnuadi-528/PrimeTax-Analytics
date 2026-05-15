const { successResponse } = require("../utils/response");
const budgetService = require("../services/budget.service");

/**
 * POST /api/budgets
 */
exports.createBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, limit, month } = req.body;

    if (!category || limit === undefined || !month) {
      const error = new Error("category, limit, and month are required");
      error.statusCode = 400;
      throw error;
    }

    const budget = await budgetService.createBudget(userId, {
      category,
      limit,
      month,
    });

    successResponse(res, budget, "Budget created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budgets
 */
exports.getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const budgets = await budgetService.getBudgetsByUser(userId);

    successResponse(res, budgets, "Budgets fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/budgets/progress?month=February 2026
 */
exports.getBudgetProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const month = req.query.month;

    const progress = await budgetService.calculateBudgetProgress(userId, month);

    successResponse(res, progress, "Budget progress fetched successfully");
  } catch (error) {
    next(error);
  }
};
