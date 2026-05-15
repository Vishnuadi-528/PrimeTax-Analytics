const { successResponse } = require("../utils/response");
const dashboardService = require("../services/dashboard.service");

/**
 * GET /dashboard/summary
 */
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const summary = await dashboardService.getDashboardSummary(userId);

    successResponse(res, summary, "Dashboard summary fetched successfully");
  } catch (error) {
    next(error);
  }
};
