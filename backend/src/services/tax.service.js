/**
 * Get tax slab rate for taxable income
 * <= 250000 → 0%
 * <= 500000 → 5%
 * else → 10%
 */
const getTaxSlabRate = (taxableIncome) => {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 250000) return 0;
  if (taxableIncome <= 500000) return 0.05;
  return 0.1;
};

/**
 * Calculate quarterly tax estimate from form input values
 */
const calculateQuarterlyTax = (formData) => {
  const businessIncome = Number(formData.businessIncome) || 0;
  const businessExpenses = Number(formData.businessExpenses) || 0;
  const retirementContribution =
    Number(formData.retirementContribution) || 0;
  const healthInsurancePremium =
    Number(formData.healthInsurancePremium) || 0;

  const totalIncome = businessIncome;
  const totalDeductions =
    businessExpenses + retirementContribution + healthInsurancePremium;
  let taxableIncome = totalIncome - totalDeductions;

  if (taxableIncome < 0) {
    taxableIncome = 0;
  }

  const slabRate = getTaxSlabRate(taxableIncome);
  const estimatedTax = taxableIncome * slabRate;

  return {
    totalIncome,
    totalDeductions,
    taxableIncome,
    estimatedTax,
  };
};

/**
 * Get tax calendar due dates
 */
const getTaxCalendar = () => {
  return [
    { quarter: "Q1", dueDate: "April 15" },
    { quarter: "Q2", dueDate: "June 15" },
    { quarter: "Q3", dueDate: "September 15" },
    { quarter: "Q4", dueDate: "January 15" },
  ];
};

module.exports = {
  calculateQuarterlyTax,
  getTaxCalendar,
};
