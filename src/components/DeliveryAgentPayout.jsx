import React from "react";

const DUMMY_DELIVERY_AGENTS = [
  {
    id: "agent-101",
    name: "Ravi Kumar",
    totalFee: 1540.5,
    lastPaid: "2025-12-10",
  },
  {
    id: "agent-102",
    name: "Priya Sharma",
    totalFee: 980.0,
    lastPaid: "2025-12-12",
  },
  {
    id: "agent-103",
    name: "Amit Singh",
    totalFee: 2100.25,
    lastPaid: "2025-12-15",
  },
];

const DeliveryAgentPayout = () => {
  return (
    <div className="card">
      <h3>💳 Payouts to Delivery Agents (DUMMY)</h3>
      <table className="payout-table">
        <thead>
          <tr>
            <th>Agent ID</th>
            <th>Name</th>
            <th>Total Fee Due</th>
            <th>Last Paid</th>
          </tr>
        </thead>
        <tbody>
          {DUMMY_DELIVERY_AGENTS.map((agent) => (
            <tr key={agent.id}>
              <td>{agent.id}</td>
              <td>{agent.name}</td>
              <td>₹{agent.totalFee.toFixed(2)}</td>
              <td>{agent.lastPaid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryAgentPayout;
