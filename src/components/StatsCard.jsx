import React from "react";

const StatsCard = ({ title, value, filterText }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p style={{ fontSize: "2em", fontWeight: "bold", margin: "10px 0" }}>
        {value}
      </p>
      <small style={{ color: "#a0a0a0" }}>{filterText}</small>
    </div>
  );
};

export default StatsCard;
