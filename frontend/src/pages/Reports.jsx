import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import apiClient from "../api/apiClient";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_OPTIONS = MONTH_NAMES.map((name, i) => ({
  value: String(i + 1),
  label: name,
}));

const QUARTER_OPTIONS = [
  { value: "Q1", label: "Q1 (Jan - Mar)" },
  { value: "Q2", label: "Q2 (Apr - Jun)" },
  { value: "Q3", label: "Q3 (Jul - Sep)" },
  { value: "Q4", label: "Q4 (Oct - Dec)" },
];

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  padding: "20px",
  border: "1px solid #e5e7eb",
};

const inputStyle = {
  width: "100%",
  maxWidth: "280px",
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

const currentYear = new Date().getFullYear();

export default function Reports() {
  const [reportType, setReportType] = useState("Monthly");
  const [period, setPeriod] = useState(
    String(new Date().getMonth() + 1)
  );
  const [year, setYear] = useState(currentYear);
  const [format, setFormat] = useState("JSON");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [lastDownloadedFormat, setLastDownloadedFormat] = useState(null);
  const [lastDownloadedParams, setLastDownloadedParams] = useState(null);

  useEffect(() => {
    if (reportType === "Monthly") {
      setPeriod(String(new Date().getMonth() + 1));
    } else {
      setPeriod("Q1");
    }
  }, [reportType]);

  const handleReset = () => {
    setReportType("Monthly");
    setPeriod(String(new Date().getMonth() + 1));
    setYear(currentYear);
    setFormat("JSON");
    setError(null);
    setReportData(null);
    setLastDownloadedFormat(null);
    setLastDownloadedParams(null);
  };

  const getReportName = () => {
    if (reportType === "Monthly") {
      return `Monthly Report - ${MONTH_NAMES[Number(period) - 1]} ${year}`;
    }
    return `Quarterly Report - ${period} ${year}`;
  };

  const getPeriodLabel = () => {
    if (reportType === "Monthly") {
      return `${MONTH_NAMES[Number(period) - 1]} ${year}`;
    }
    return `${period} ${year}`;
  };

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFromPreview = async () => {
    const params = lastDownloadedParams || {
      reportType,
      period,
      year,
      format: reportData ? "JSON" : format,
    };
    try {
      const type = params.reportType === "Monthly" ? "monthly" : "quarterly";
      const periodStr =
        params.reportType === "Monthly"
          ? `${MONTH_NAMES[Number(params.period) - 1]} ${params.year}`
          : `${params.period} ${params.year}`;
      if (params.format === "CSV" || reportData) {
        let url = `/reports/export-csv?type=${type}&year=${params.year}`;
        if (type === "monthly") url += `&month=${params.period}`;
        else url += `&quarter=${params.period}`;
        const res = await apiClient.get(url, { responseType: "blob" });
        triggerDownload(res.data, `report-${periodStr.replace(/\s/g, "-")}.csv`);
      } else if (params.format === "PDF") {
        let url = `/reports/export-pdf?type=${type}&year=${params.year}`;
        if (type === "monthly") url += `&month=${params.period}`;
        else url += `&quarter=${params.period}`;
        const res = await apiClient.get(url, { responseType: "blob" });
        triggerDownload(res.data, `report-${periodStr.replace(/\s/g, "-")}.pdf`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Download failed");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportData(null);
    setLastDownloadedFormat(null);
    setLastDownloadedParams(null);

    const newReportEntry = {
      id: Date.now(),
      name: getReportName(),
      generatedDate: new Date().toLocaleString(),
      period: getPeriodLabel(),
    };

    try {
      if (format === "JSON") {
        let data;
        if (reportType === "Monthly") {
          const res = await apiClient.get(
            `/reports/monthly?month=${period}&year=${year}`
          );
          data = res.data?.data || res.data;
        } else {
          const res = await apiClient.get(
            `/reports/quarterly?quarter=${period}&year=${year}`
          );
          data = res.data?.data || res.data;
        }
        setReportData(data);
        setRecentReports((prev) => [newReportEntry, ...prev].slice(0, 5));
      } else if (format === "CSV") {
        const type = reportType === "Monthly" ? "monthly" : "quarterly";
        let url = `/reports/export-csv?type=${type}&year=${year}`;
        if (type === "monthly") url += `&month=${period}`;
        else url += `&quarter=${period}`;

        const res = await apiClient.get(url, { responseType: "blob" });
        const filename = `report-${reportType === "Monthly" ? MONTH_NAMES[Number(period) - 1] : period}-${year}.csv`;
        triggerDownload(res.data, filename);
        setLastDownloadedFormat("CSV");
        setLastDownloadedParams({ reportType, period, year, format });
        setRecentReports((prev) => [newReportEntry, ...prev].slice(0, 5));
      } else if (format === "PDF") {
        const type = reportType === "Monthly" ? "monthly" : "quarterly";
        let url = `/reports/export-pdf?type=${type}&year=${year}`;
        if (type === "monthly") url += `&month=${period}`;
        else url += `&quarter=${period}`;

        const res = await apiClient.get(url, { responseType: "blob" });
        const filename = `report-${reportType === "Monthly" ? MONTH_NAMES[Number(period) - 1] : period}-${year}.pdf`;
        triggerDownload(res.data, filename);
        setLastDownloadedFormat("PDF");
        setLastDownloadedParams({ reportType, period, year, format });
        setRecentReports((prev) => [newReportEntry, ...prev].slice(0, 5));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <h2 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: 600 }}>
        Financial Reports
      </h2>

      <div style={{ ...cardStyle, marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "16px" }}>
          Generate Report
        </h3>
        <form onSubmit={handleGenerate}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={inputStyle}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={inputStyle}
              >
                {reportType === "Monthly"
                  ? MONTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))
                  : QUARTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2020"
                max="2030"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                style={inputStyle}
              >
                <option value="JSON">JSON</option>
                <option value="CSV">CSV</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
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

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={handleReset}
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
              Reset
            </button>
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
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </form>
      </div>

      {recentReports.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
            Recent Reports
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Report Name
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Generated Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Period
                </th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{r.name}</td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>
                    {r.generatedDate}
                  </td>
                  <td style={{ padding: "12px", fontSize: "14px" }}>{r.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportData && format === "JSON" && (
        <div style={{ ...cardStyle }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
            Report Preview
          </h3>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: "8px 16px",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadFromPreview}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Download
            </button>
          </div>
          <div
            style={{
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#6b7280" }}>Period: </span>
              <strong>{reportData.period}</strong>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#6b7280" }}>Total Income: </span>
              <strong>${Number(reportData.totalIncome || 0).toFixed(2)}</strong>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#6b7280" }}>Total Expense: </span>
              <strong>${Number(reportData.totalExpense || 0).toFixed(2)}</strong>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#6b7280" }}>Net Profit: </span>
              <strong>${Number(reportData.netProfit || 0).toFixed(2)}</strong>
            </div>
            {reportData.transactions && reportData.transactions.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Transactions
                </div>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ textAlign: "left", padding: "8px" }}>Type</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>
                        Category
                      </th>
                      <th style={{ textAlign: "left", padding: "8px" }}>
                        Amount
                      </th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.transactions.slice(0, 10).map((t, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "8px" }}>{t.type}</td>
                        <td style={{ padding: "8px" }}>{t.category}</td>
                        <td style={{ padding: "8px" }}>
                          ${Number(t.amount).toFixed(2)}
                        </td>
                        <td style={{ padding: "8px" }}>
                          {t.date
                            ? new Date(t.date).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.transactions.length > 10 && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    Showing 10 of {reportData.transactions.length} transactions
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {(lastDownloadedFormat === "CSV" || lastDownloadedFormat === "PDF") && (
        <div style={{ ...cardStyle }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px" }}>
            Report Preview
          </h3>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleDownloadFromPreview}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Download
            </button>
          </div>
          <div
            style={{
              padding: "16px",
              background: "#f9fafb",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: 0, color: "#6b7280" }}>
              {lastDownloadedFormat} file was downloaded. Click Download to
              download again.
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
