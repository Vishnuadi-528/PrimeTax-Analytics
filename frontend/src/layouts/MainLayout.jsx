import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/transactions", label: "Transactions" },
    { path: "/budgets", label: "Budgets" },
    { path: "/tax-estimator", label: "Tax Estimator" },
    { path: "/reports", label: "Reports" },
  ];

  const username = user?.name || user?.email || "User";

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2 className="sidebar-brand">TaxPal</h2>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.path} className="sidebar-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-avatar" />
          <span className="sidebar-username">{username}</span>
          <button onClick={logout} className="sidebar-logout">
            Logout
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
