import { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";

const TransactionList = ({ refreshTrigger, onTransactionChange, hideTitle }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", category: "", date: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/transactions");
      const data = response.data.data;
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger, fetchTransactions]);

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      amount: String(transaction.amount),
      category: transaction.category,
      date: transaction.date
        ? new Date(transaction.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      await apiClient.put(`/transactions/${editingId}`, {
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: editForm.date,
      });
      setEditingId(null);
      fetchTransactions();
      if (onTransactionChange) onTransactionChange();
    } catch (err) {
      console.error("Failed to update transaction", err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      setDeleteConfirmId(null);
      fetchTransactions();
      if (onTransactionChange) onTransactionChange();
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  if (loading) {
    return (
      <div className="transactions-card">
        {!hideTitle && <h2 className="transactions-title">Transactions</h2>}
        <p className="transactions-loading">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-card">
        {!hideTitle && <h2 className="transactions-title">Transactions</h2>}
        <div className="transactions-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="transactions-card">
      {!hideTitle && <h2 className="transactions-title">Transactions</h2>}

      {transactions.length === 0 ? (
        <div className="text-slate-600 py-8 text-center">
          No transactions yet. Add your first transaction above.
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              {editingId === transaction._id ? (
                <form
                  onSubmit={handleEditSubmit}
                  className="flex-1 flex flex-wrap items-center gap-2"
                >
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                    step="0.01"
                    min="0"
                    required
                    className="w-24 px-2 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    required
                    className="w-32 px-2 py-1 border rounded"
                  />
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    required
                    className="px-2 py-1 border rounded"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-2 py-1 bg-slate-300 rounded text-sm"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-0.5 rounded text-sm font-medium ${
                        transaction.type === "income"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                    <span className="text-slate-700">{transaction.category}</span>
                    <span className="text-slate-500 text-sm">
                      {transaction.date
                        ? new Date(transaction.date).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      ${Number(transaction.amount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    {deleteConfirmId === transaction._id ? (
                      <span className="flex gap-1">
                        <button
                          onClick={() => handleDeleteConfirm(transaction._id)}
                          className="px-2 py-1 text-sm bg-red-600 text-white rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={handleDeleteCancel}
                          className="px-2 py-1 text-sm bg-slate-300 rounded"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(transaction._id)}
                        className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
