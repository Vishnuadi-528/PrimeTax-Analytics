const SummaryCard = ({ title, value, icon }) => {
  return (
    <div className="dashboard-card">
      <div>
        <h3 className="dashboard-card-title">{title}</h3>
        <p className="dashboard-card-value">{value}</p>
      </div>
      {icon && <span className="dashboard-card-icon">{icon}</span>}
    </div>
  );
};

export default SummaryCard;
