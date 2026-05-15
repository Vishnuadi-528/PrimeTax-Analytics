const { successResponse } = require("../utils/response");
const taxService = require("../services/tax.service");

/**
 * POST /api/tax/estimate
 */
exports.estimateTax = async (req, res, next) => {
  try {
    const {
      country,
      filingStatus,
      quarter,
      year,
      businessIncome,
      businessExpenses,
      retirementContribution,
      healthInsurancePremium,
    } = req.body;

    if (!quarter || !year) {
      const error = new Error("quarter and year are required");
      error.statusCode = 400;
      throw error;
    }

    const summary = taxService.calculateQuarterlyTax({
      country,
      filingStatus,
      quarter,
      year,
      businessIncome,
      businessExpenses,
      retirementContribution,
      healthInsurancePremium,
    });

    successResponse(res, summary, "Tax estimate calculated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tax/calendar
 */
exports.getTaxCalendar = async (req, res, next) => {
  try {
    const calendar = taxService.getTaxCalendar();

    successResponse(res, calendar, "Tax calendar fetched successfully");
  } catch (error) {
    next(error);
  }
};
