import React from "react";
import { format } from "date-fns";

const OrderCard = ({ order }) => {
  // Helper function to determine badge style
  const getStatusBadge = (status) => {
    let color = "#a0a0a0"; // Default gray
    if (status === "delivered") color = "#4CAF50"; // Green
    else if (status === "pending") color = "#FFC107"; // Amber/Yellow
    else if (status === "cancelled") color = "#F44336"; // Red

    return (
      <span
        style={{
          backgroundColor: color,
          color: "#121212",
          padding: "4px 8px",
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "0.8rem",
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const orderTimeFormatted = order?.orderTime
    ? format(new Date(order.orderTime), "MMM dd, h:mm a")
    : "N/A";

  const deliveryTimeFormatted = order?.$updatedAt
    ? format(new Date(order?.$updatedAt), "MMM dd, h:mm a")
    : "N/A";

  // Calculate total item price (pre-discount) for display clarity
  // Calculate total item price (pre-discount) with safety checks
  const itemsArray = Array.isArray(order?.items) ? order.items : [];

  const subTotal = itemsArray.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  const finalTotal =
    (order.totalAmount || 0) +
    (order.delivery_charge || 0) -
    (order.discountAmount || 0);

  const address = JSON.parse(order?.deliveryAddress);

  return (
    <div className="order-card">
      <div
        className="card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0, color: "#bb86fc", fontSize: "1.2rem" }}>
          Order #{order.$id}
        </h3>
        {getStatusBadge(order.orderStatus)}
      </div>

      <div
        className="order-details"
        style={{ fontSize: "0.9rem", marginBottom: "15px" }}
      >
        <p>
          <strong>Customer:</strong> {order.customerName} ({order.phoneNumber})
        </p>
        {/* <p>
          <strong>Restaurant ID:</strong> {order.restaurantIdText}
        </p> */}
        <p>
          <strong>Order Time:</strong> {orderTimeFormatted}
        </p>
        <p>
          <strong>Delivery Time:</strong> {deliveryTimeFormatted}
        </p>
        <p>
          <strong>Address:</strong>{" "}
          {address?.details || address?.street || "N/A"}
        </p>
        <p>
          <strong>Delivery Agent:</strong>{" "}
          {order?.deliveryAgentId?.name || "N/A"} ({order?.deliveryAgentFee})
        </p>
        <p>
          <strong>Restaurant:</strong> {order.restaurantId?.name || "N/A"}
        </p>
      </div>

      {/* Items List */}
      <div
        className="order-items-list"
        style={{ borderTop: "1px solid #333", padding: "10px 0" }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#a0a0a0" }}>Items:</h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {Array.isArray(order.items) &&
            order.items.map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "5px",
                  padding: "5px 0",
                  borderBottom: "1px dotted #2a2a2a",
                }}
              >
                {item.quantity} x {item.name}
                <span style={{ float: "right", fontWeight: "bold" }}>
                  ₹{(item.price * item.quantity).toFixed(2)}/₹
                  {(item.restaurantPrice * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* Financial Summary */}
      <div
        className="order-finance"
        style={{
          borderTop: "1px solid #333",
          paddingTop: "10px",
          marginTop: "10px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal:</span>
          <span>₹{subTotal.toFixed(2)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#8bc34a",
          }}
        >
          <span>Delivery Fee:</span>
          <span>+ ₹{(order.delivery_charge || 0).toFixed(2)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#f44336",
          }}
        >
          <span>Discount:</span>
          <span>- ₹{(order.discountAmount || 0).toFixed(2)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
            fontWeight: "bold",
            borderTop: "1px solid #555",
            paddingTop: "5px",
          }}
        >
          <span>Grand Total:</span>
          <span>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
