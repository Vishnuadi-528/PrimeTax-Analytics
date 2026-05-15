const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const { successResponse } = require("../utils/response");
const reportService = require("../services/report.service");

/**
 * GET /api/reports/monthly?month=2&year=2026
 */
exports.getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const month = req.query.month;
    const year = req.query.year;

    if (!month || !year) {
      const error = new Error("month and year are required");
      error.statusCode = 400;
      throw error;
    }

    const report = await reportService.generateMonthlyReport(userId, month, year);
    successResponse(res, report, "Monthly report generated");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/quarterly?quarter=Q1&year=2026
 */
exports.getQuarterlyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const quarter = req.query.quarter;
    const year = req.query.year;

    if (!quarter || !year) {
      const error = new Error("quarter and year are required");
      error.statusCode = 400;
      throw error;
    }

    const report = await reportService.generateQuarterlyReport(
      userId,
      quarter,
      year,
    );
    successResponse(res, report, "Quarterly report generated");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/export-csv?type=monthly&month=2&year=2026
 * GET /api/reports/export-csv?type=quarterly&quarter=Q1&year=2026
 */
exports.exportCsv = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const type = req.query.type;
    const month = req.query.month;
    const quarter = req.query.quarter;
    const year = req.query.year;

    if (!type || !year) {
      const error = new Error("type and year are required");
      error.statusCode = 400;
      throw error;
    }

    let report;
    if (type === "monthly") {
      if (!month) {
        const error = new Error("month is required for monthly export");
        error.statusCode = 400;
        throw error;
      }
      report = await reportService.generateMonthlyReport(userId, month, year);
    } else if (type === "quarterly") {
      if (!quarter) {
        const error = new Error("quarter is required for quarterly export");
        error.statusCode = 400;
        throw error;
      }
      report = await reportService.generateQuarterlyReport(
        userId,
        quarter,
        year,
      );
    } else {
      const error = new Error("type must be monthly or quarterly");
      error.statusCode = 400;
      throw error;
    }

    const transactions = report.transactions.map((t) => ({
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date instanceof Date ? t.date.toISOString() : t.date,
    }));

    const parser = new Parser({ fields: ["type", "category", "amount", "date"] });
    const csv = parser.parse(transactions);

    const filename = `report-${report.period.replace(/\s/g, "-")}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/export-pdf?type=monthly&month=2&year=2026
 * GET /api/reports/export-pdf?type=quarterly&quarter=Q1&year=2026
 */
exports.exportPdf = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const type = req.query.type || "monthly";
    const month = req.query.month;
    const quarter = req.query.quarter;
    const year = req.query.year;

    const now = new Date();
    const currentYear = year ? Number(year) : now.getFullYear();
    const currentMonth = month ? Number(month) : now.getMonth() + 1;

    let report;
    if (type === "quarterly") {
      const q = quarter || (currentMonth <= 3 ? "Q1" : currentMonth <= 6 ? "Q2" : currentMonth <= 9 ? "Q3" : "Q4");
      report = await reportService.generateQuarterlyReport(userId, q, currentYear);
    } else {
      report = await reportService.generateMonthlyReport(
        userId,
        currentMonth,
        currentYear,
      );
    }

    const doc = new PDFDocument();
    const filename = `report-${report.period.replace(/\s/g, "-")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    doc.fontSize(18).text("Financial Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${report.period}`, { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text(`Total Income: ${report.totalIncome}`);
    doc.text(`Total Expense: ${report.totalExpense}`);
    doc.text(`Net Profit: ${report.netProfit}`);
    doc.end();
  } catch (error) {
    next(error);
  }
};
