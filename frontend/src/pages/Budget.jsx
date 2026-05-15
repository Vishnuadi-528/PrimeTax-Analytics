import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import MainLayout from "../layouts/MainLayout";
import apiClient from "../api/apiClient";

ChartJS.register(ArcElement, Tooltip, Legend);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = -2; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    options.push({ value: label, label });
  }
  return options;
};

const getInitialFormData = () => {
  const now = new Date();
  const month = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  return {
    category: "",
    limit: "",
    month,
    description: "",
  };
};

export default function Budget() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        `/budgets/progress?month=${encodeURIComponent(selectedMonth)}`
      );
      const data = response.data.data;
      setProgress(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load budget data");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const totalBudget = useMemo(() => {
    return progress.reduce((sum, p) => sum + Number(p.limit || 0), 0);
  }, [progress]);

  const totalSpent = useMemo(() => {
    return progress.reduce((sum, p) => sum + Number(p.spent || 0), 0);
  }, [progress]);

  const remaining = totalBudget - totalSpent;

  const budgetHealth = useMemo(() => {
    if (totalBudget <= 0) return "Good";
    const percentUsed = (totalSpent / totalBudget) * 100;
    if (totalSpent > totalBudget) return "Over";
    if (percentUsed >= 80) return "Warning";
    return "Good";
  }, [totalBudget, totalSpent]);

  const pieChartData = useMemo(() => {
    const labels = progress.map((p) => p.category);
    const data = progress.map((p) => Number(p.spent || 0));
    const hasData = data.some((v) => v > 0);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#3b82f6",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
        },
      ],
      hasData,
    };
  }, [progress]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      await apiClient.post("/budgets", {
        category: formData.category.trim(),
        limit: parseFloat(formData.limit),
        month: formData.month.trim(),
      });
      setFormData(getInitialFormData());
      setShowForm(false);
      fetchProgress();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create budget");
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormData(getInitialFormData());
    setFormError("");
  };

  const getStatusColor = (status) => {
    if (status === "Good") return "#22c55e";
    if (status === "Warning") return "#f59e0b";
    return "#dc2626";
  };

  const getHealthColor = () => {
    if (budgetHealth === "Good") return "#22c55e";
    if (budgetHealth === "Warning") return "#f59e0b";
    return "#dc2626";
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: "20px",
    border: "1px solid #e5e7eb",
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          Loading...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: 600 }}>
        Budget
      </h2>

      {error && (
        <div
          style={{
            padding: "16px",
            background: "#fef2f2",
            color: "#dc2626",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ ...cardStyle, flex: 1, minWidth: "160px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
            Total Budget
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600 }}>
            ${totalBudget.toFixed(2)}
          </div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: "160px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
            Currently Spent
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600 }}>
            ${totalSpent.toFixed(2)}
          </div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: "160px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
            Remaining
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600 }}>
            ${remaining.toFixed(2)}
          </div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: "160px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
            Budget Health
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: getHealthColor(),
            }}
          >
            {budgetHealth}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ fontSize: "14px" }}>Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          {getMonthOptions().map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
          Create New Budget
        </h3>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Add Budget
          </button>
        ) : (
          <form onSubmit={handleCreateBudget}>
            {formError && (
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
                {formError}
              </div>
            )}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                required
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                Budget Amount
              </label>
              <input
                type="number"
                name="limit"
                value={formData.limit}
                onChange={handleFormChange}
                step="0.01"
                min="0"
                required
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                Month
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleFormChange}
                required
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                {getMonthOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}>
                Description (optional)
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={handleCancelForm}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: formLoading ? "not-allowed" : "pointer",
                  opacity: formLoading ? 0.7 : 1,
                }}
              >
                {formLoading ? "Creating..." : "Create Budget"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ ...cardStyle, marginBottom: "24px", overflowX: "auto" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>Budget Table</h3>
        {progress.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
            No budgets for this month. Create one above.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: 600 }}>
                  Category
                </th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: 600 }}>
                  Budget
                </th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: 600 }}>
                  Spent
                </th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: 600 }}>
                  Remaining
                </th>
                <th style={{ textAlign: "left", padding: "12px", fontSize: "13px", fontWeight: 600 }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {progress.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{row.category}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>
                    ${Number(row.limit).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>
                    ${Number(row.spent).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>
                    ${Number(row.remaining).toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", fontSize: "14px", color: getStatusColor(row.status) }}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ ...cardStyle }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
          Spending Breakdown
        </h3>
        <div style={{ height: "250px" }}>
          {pieChartData.hasData ? (
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              No spending data for this month
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
