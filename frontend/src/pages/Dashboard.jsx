import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import MainLayout from "../layouts/MainLayout";
import SummaryCard from "../components/dashboard/SummaryCard";
import TransactionList from "../components/dashboard/TransactionList";
import apiClient from "../api/apiClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const getInitialFormData = () => ({
  category: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
});

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("income");
  const [formData, setFormData] = useState(getInitialFormData());
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/dashboard/summary");
      const data = response.data.data;
      setSummary(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleTransactionChange = () => {
    setRefreshTrigger((t) => t + 1);
    fetchSummary();
  };

  const openModal = (type) => {
    setTransactionType(type);
    setFormData(getInitialFormData());
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
  };

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    try {
      await apiClient.post("/transactions", {
        type: transactionType,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
      });
      closeModal();
      handleTransactionChange();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setModalLoading(false);
    }
  };

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const netBalance = summary?.balance ?? 0;

  const barChartData = useMemo(
    () => ({
      labels: ["Total Income", "Total Expense"],
      datasets: [
        {
          label: "Amount",
          data: [totalIncome, totalExpense],
          backgroundColor: ["#22c55e", "#dc2626"],
        },
      ],
    }),
    [totalIncome, totalExpense]
  );

  const expenseBreakdown = useMemo(() => {
    const transactions = summary?.last5Transactions ?? [];
    const byCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + Number(t.amount);
        return acc;
      }, {});
    return {
      labels: Object.keys(byCategory),
      data: Object.values(byCategory),
    };
  }, [summary?.last5Transactions]);

  const pieChartData = useMemo(
    () => ({
      labels: expenseBreakdown.labels,
      datasets: [
        {
          data: expenseBreakdown.data,
          backgroundColor: [
            "#3b82f6",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
        },
      ],
    }),
    [expenseBreakdown]
  );

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          Loading...
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div
          style={{
            padding: "16px",
            background: "#fef2f2",
            color: "#dc2626",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => openModal("income")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Add Income
        </button>
        <button
          type="button"
          onClick={() => openModal("expense")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Add Expense
        </button>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              ×
            </button>

            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px" }}>
              Add {transactionType === "income" ? "Income" : "Expense"}
            </h3>

            {modalError && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "6px",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSave}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleModalChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleModalChange}
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "6px",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleModalChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={closeModal}
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
                  disabled={modalLoading}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: modalLoading ? "not-allowed" : "pointer",
                    opacity: modalLoading ? 0.7 : 1,
                  }}
                >
                  {modalLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-cards">
        <SummaryCard
          title="Total Income"
          value={`$${Number(totalIncome).toFixed(2)}`}
          icon="↑"
        />
        <SummaryCard
          title="Total Expense"
          value={`$${Number(totalExpense).toFixed(2)}`}
          icon="↓"
        />
        <SummaryCard
          title="Net Balance"
          value={`$${Number(netBalance).toFixed(2)}`}
          icon="▣"
        />
      </div>

      <div
        className="dashboard-charts"
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div
          className="dashboard-chart"
          style={{
            flex: 1,
            minWidth: "280px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "20px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 className="dashboard-chart-title">Income vs Expense</h3>
          <div style={{ height: "200px" }}>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
        <div
          className="dashboard-chart"
          style={{
            flex: 1,
            minWidth: "280px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "20px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 className="dashboard-chart-title">Expense Breakdown</h3>
          <div style={{ height: "200px" }}>
            {expenseBreakdown.labels.length > 0 ? (
              <Pie
                data={pieChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            ) : (
              <div
                className="dashboard-chart-placeholder"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                }}
              >
                No expense data
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="dashboard-section-title">Recent Transactions</h3>
        <TransactionList
          refreshTrigger={refreshTrigger}
          onTransactionChange={handleTransactionChange}
          hideTitle
        />
      </div>
    </MainLayout>
  );
};
