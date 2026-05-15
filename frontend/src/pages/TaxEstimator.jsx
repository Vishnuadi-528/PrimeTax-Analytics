import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import apiClient from "../api/apiClient";

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  padding: "20px",
  border: "1px solid #e5e7eb",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  marginBottom: "6px",
};

export default function TaxEstimator() {
  const [formData, setFormData] = useState({
    country: "United States",
    filingStatus: "Individual",
    quarter: "Q1",
    year: new Date().getFullYear(),
    businessIncome: "",
    businessExpenses: "",
    retirementContributions: "",
    healthInsurancePremium: "",
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [calendar, setCalendar] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      setCalendarLoading(true);
      setCalendarError(null);
      try {
        const response = await apiClient.get("/tax/calendar");
        const data = response.data.data;
        setCalendar(Array.isArray(data) ? data : []);
      } catch (err) {
        setCalendar([]);
        setCalendarError("Failed to load tax calendar.");
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  const getDueDateYear = (quarter) => {
    const year = Number(formData.year) || new Date().getFullYear();
    return quarter === "Q4" ? year + 1 : year;
  };

  const getFormattedDueDate = (dueDateStr, quarter) => {
    const year = getDueDateYear(quarter);
    return `${dueDateStr}, ${year}`;
  };

  const getStatus = (dueDateStr, quarter) => {
    const year = getDueDateYear(quarter);
    const monthMap = {
      "April 15": 3,
      "June 15": 5,
      "September 15": 8,
      "January 15": 0,
    };
    const month = monthMap[dueDateStr];
    if (month === undefined) return "Upcoming";
    const dueDate = new Date(year, month, 15);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate.getTime() === today.getTime()) return "Due Today";
    if (dueDate.getTime() < today.getTime()) return "Overdue";
    return "Upcoming";
  };

  const getStatusBadgeStyle = (status) => {
    if (status === "Overdue") return { backgroundColor: "#fef2f2", color: "#dc2626" };
    if (status === "Due Today") return { backgroundColor: "#fff7ed", color: "#ea580c" };
    return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const body = {
        country: formData.country,
        filingStatus: formData.filingStatus,
        quarter: formData.quarter,
        year: Number(formData.year),
        businessIncome: Number(formData.businessIncome) || 0,
        businessExpenses: Number(formData.businessExpenses) || 0,
        retirementContribution: Number(formData.retirementContributions) || 0,
        healthInsurancePremium: Number(formData.healthInsurancePremium) || 0,
      };
      const response = await apiClient.post("/tax/estimate", body);
      setSummary(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate tax estimate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <h2 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: 600 }}>
        Tax Estimator
      </h2>

      <div
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ ...cardStyle, flex: 1, minWidth: "280px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px" }}>
            Quarterly Tax Calculator
          </h3>
          <form onSubmit={handleCalculate}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="United States">United States</option>
                <option value="India">India</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Filing Status</label>
              <select
                name="filingStatus"
                value={formData.filingStatus}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Individual">Individual</option>
                <option value="Married">Married</option>
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Quarter</label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2020"
                max="2030"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Business Income</label>
              <input
                type="number"
                name="businessIncome"
                value={formData.businessIncome}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Business Expenses</label>
              <input
                type="number"
                name="businessExpenses"
                value={formData.businessExpenses}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Retirement Contributions</label>
              <input
                type="number"
                name="retirementContributions"
                value={formData.retirementContributions}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Health Insurance Premium</label>
              <input
                type="number"
                name="healthInsurancePremium"
                value={formData.healthInsurancePremium}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0"
                style={inputStyle}
              />
            </div>
            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Calculating..." : "Calculate Estimated Tax"}
            </button>
          </form>
        </div>

        <div style={{ ...cardStyle, flex: 1, minWidth: "280px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "16px" }}>
            Tax Summary
          </h3>
          {summary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                  Total Income
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  ${Number(summary.totalIncome || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                  Total Deductions
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  ${Number(summary.totalDeductions || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                  Taxable Income
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  ${Number(summary.taxableIncome || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                  Estimated Tax
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  ${Number(summary.estimatedTax || 0).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "14px",
              }}
            >
              Your estimated tax will appear here.
            </div>
          )}
        </div>
      </div>

      <div style={{ ...cardStyle }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px" }}>
          Tax Calendar
        </h3>
        {calendarLoading ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
            Loading...
          </div>
        ) : calendarError ? (
          <div
            style={{
              padding: "16px",
              background: "#fef2f2",
              color: "#dc2626",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            {calendarError}
          </div>
        ) : calendar.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {calendar.map((item, i) => {
              const status = getStatus(item.dueDate, item.quarter);
              const formattedDate = getFormattedDueDate(item.dueDate, item.quarter);
              const badgeStyle = getStatusBadgeStyle(status);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#6b7280",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>
                      {item.quarter}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      {formattedDate}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      fontSize: "12px",
                      borderRadius: "4px",
                      ...badgeStyle,
                    }}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            No calendar data available.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
