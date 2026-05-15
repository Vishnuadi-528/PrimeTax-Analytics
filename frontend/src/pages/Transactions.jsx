import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import TransactionForm from "../components/dashboard/TransactionForm";
import TransactionList from "../components/dashboard/TransactionList";

export default function Transactions() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionChange = () => {
    setRefreshTrigger((t) => t + 1);
  };

  return (
    <MainLayout>
      <div>
        <h2 className="dashboard-section-title">Transactions</h2>
        <div className="transactions-form-wrap">
          <TransactionForm onSuccess={handleTransactionChange} />
        </div>
        <TransactionList
          refreshTrigger={refreshTrigger}
          onTransactionChange={handleTransactionChange}
        />
      </div>
    </MainLayout>
  );
}
