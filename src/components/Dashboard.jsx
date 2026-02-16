import React, { useState, useEffect, useMemo } from "react";
import StatsCard from "./StatsCard";
import DeliveryAgentPayout from "./DeliveryAgentPayout";
import RestaurantPayout from "./RestaurantPayout";
import { ordersService } from "../appwrite/OrdersService";
import { startOfDay, endOfDay } from "date-fns";
import OrderCard from "./OrderCard";
import { Expense } from "../appwrite/expense";

const dateFilters = {
  TODAY: "today",
  CUSTOM: "custom",
  ALL: "all",
};

const orderStatuses = [
  { label: "All Statuses", value: "all" },
  { label: "Delivered", value: "delivered" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
  // Add other statuses as needed (e.g., 'processing', 'shipped')
];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(dateFilters.TODAY); // Renamed 'filter' to 'dateFilter' for clarity
  const [statusFilter, setStatusFilter] = useState("delivered"); // New state for status filter
  const [customRange, setCustomRange] = useState({
    start: "", // Date string YYYY-MM-DD
    end: "",
  });
  const [expense, setExpense] = useState([]);

  // Load orders now accepts the status filter
  const loadOrders = async (startIso = null, endIso = null, status = "all") => {
    setLoading(true);
    setError(null);
    // Pass all three filters to the service
    const result = await ordersService.getOrders(startIso, endIso, status);
    const expenses = await Expense.getExpenses();
    let totalExp = 0;

    if (result.success) {
      setOrders(result.data);
      expenses.data.map((item) => (totalExp = totalExp + item.Amount_paid));
      setExpense(totalExp);
    } else {
      setError(result.error || "Failed to fetch orders.");
    }
    setLoading(false);
  };

  useEffect(() => {
    let startDateIso = null;
    let endDateIso = null;

    // --- 1. Date Filter Logic: Generate ISO Strings ---
    if (dateFilter === dateFilters.TODAY) {
      startDateIso = startOfDay(new Date()).toISOString();
      endDateIso = endOfDay(new Date()).toISOString();
    } else if (
      dateFilter === dateFilters.CUSTOM &&
      customRange.start &&
      customRange.end
    ) {
      startDateIso = startOfDay(new Date(customRange.start)).toISOString();
      endDateIso = endOfDay(new Date(customRange.end)).toISOString();
    }
    // dateFilter === dateFilters.ALL means startDateIso and endDateIso remain null

    // --- 2. Call Service with all filters ---
    loadOrders(startDateIso, endDateIso, statusFilter);
  }, [dateFilter, customRange, statusFilter]); // Re-run effect when dateFilter or statusFilter changes

  const handleCustomRangeChange = (e) => {
    setCustomRange({ ...customRange, [e.target.name]: e.target.value });
  };

  // Note: The calculateMetrics function and metrics/filterDisplay memos are unchanged
  // as they operate on the filtered `orders` list, which is now fetched by the service.

  const calculateMetrics = ({ orderList }) => {
    let totalOrders = orderList.length;
    let totalEarnings = 0;
    let totalDeliveryAgentFee = 0;
    let totalRestaurantRevenue = 0;

    if (!Array.isArray(orderList)) {
      return {
        totalOrders: 0,
        totalEarnings: "0.00",
        totalDeliveryAgentFee: "0.00",
        totalRestaurantRevenue: "0.00",
        totalProfit: "0.00",
      };
    }

    orderList.forEach((order) => {
      const orderTotalAmount = order.totalAmount || 0;
      const orderDeliveryCharge = order.delivery_charge || 0;
      const orderDiscount = order.discountAmount || 0;
      const orderDeliveryAgentFee = order.deliveryAgentFee || 0;

      const orderEarnings =
        orderTotalAmount + orderDeliveryCharge - orderDiscount;
      totalEarnings += orderEarnings;
      totalDeliveryAgentFee += orderDeliveryAgentFee;

      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          totalRestaurantRevenue +=
            (item.restaurantPrice || 0) * (item.quantity || 1);
        });
      }
    });

    let totalProfit =
      totalEarnings - totalDeliveryAgentFee - totalRestaurantRevenue;

    if (dateFilter.includes("all") && statusFilter.includes("delivered")) {
      totalProfit = totalProfit - expense;
    }

    return {
      totalOrders,
      totalEarnings: totalEarnings.toFixed(2),
      totalDeliveryAgentFee: totalDeliveryAgentFee.toFixed(2),
      totalRestaurantRevenue: totalRestaurantRevenue.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
    };
  };

  const metrics = useMemo(
    () =>
      calculateMetrics({
        orderList: orders,
      }),
    [orders],
  );

  const filterDisplay = useMemo(() => {
    const statusText =
      statusFilter === "all"
        ? "All Statuses"
        : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    let dateText;
    if (dateFilter === dateFilters.TODAY) dateText = "Today";
    else if (dateFilter === dateFilters.ALL) dateText = "All Time";
    else if (
      dateFilter === dateFilters.CUSTOM &&
      customRange.start &&
      customRange.end
    ) {
      dateText = `${customRange.start} to ${customRange.end}`;
    } else dateText = "Custom Range";

    return `Status: ${statusText}, Dates: ${dateText}`;
  }, [dateFilter, customRange, statusFilter]);

  if (loading)
    return <div className="dashboard-container">Loading orders...</div>;
  if (error)
    return (
      <div className="dashboard-container" style={{ color: "red" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="dashboard-container">
      <h1>📊 CEO (cravingo earnings order) Dashboard</h1>

      {/* --- Filter Controls --- */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "15px",
          alignItems: "flex-end",
          backgroundColor: "#1e1e1e",
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        {/* Status Filter Dropdown */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Order Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "8px",
              background: "#333",
              border: "1px solid #555",
              color: "#e0e0e0",
              minWidth: "150px",
            }}
          >
            {orderStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters: Today/All Time Buttons */}
        <button
          onClick={() => setDateFilter(dateFilters.TODAY)}
          style={{
            background: dateFilter === dateFilters.TODAY ? "#bb86fc" : "#333",
            color: "#e0e0e0",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Today
        </button>
        <button
          onClick={() => setDateFilter(dateFilters.ALL)}
          style={{
            background: dateFilter === dateFilters.ALL ? "#bb86fc" : "#333",
            color: "#e0e0e0",
            padding: "10px 15px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          All Time
        </button>

        {/* Custom Filter Controls */}
        <div
          style={{
            marginLeft: "20px",
            borderLeft: "1px solid #333",
            paddingLeft: "20px",
          }}
        >
          <label style={{ display: "block", marginBottom: "5px" }}>
            Custom Date Range:
          </label>
          <input
            type="date"
            name="start"
            value={customRange.start}
            onChange={handleCustomRangeChange}
            style={{
              padding: "8px",
              marginRight: "10px",
              background: "#333",
              border: "1px solid #555",
              color: "#e0e0e0",
            }}
          />
          <input
            type="date"
            name="end"
            value={customRange.end}
            onChange={handleCustomRangeChange}
            style={{
              padding: "8px",
              background: "#333",
              border: "1px solid #555",
              color: "#e0e0e0",
            }}
          />
          <button
            onClick={() => setDateFilter(dateFilters.CUSTOM)}
            style={{
              background:
                dateFilter === dateFilters.CUSTOM ? "#bb86fc" : "#333",
              color: "#e0e0e0",
              padding: "10px 15px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Apply Custom Filter
          </button>
        </div>
      </div>

      {/* --- Statistics Grid --- */}
      <h2>Key Metrics</h2>
      <div className="stats-grid">
        <StatsCard
          title="Total Orders"
          value={metrics.totalOrders}
          filterText={filterDisplay}
        />
        {/* ... other StatsCards using the same logic ... */}
        <StatsCard
          title="Total Earnings"
          value={`₹${metrics.totalEarnings}`}
          filterText={`Gross: (Order Amt + Delivery Fee) - Discount. ${filterDisplay}`}
        />
        <StatsCard
          title="Total Profit"
          value={`₹${metrics.totalProfit}`}
          filterText={`Earnings - (Agent Fee + Restaurant Revenue). ${filterDisplay}`}
        />
        <StatsCard
          title="Paid to Agents"
          value={`₹${metrics.totalDeliveryAgentFee}`}
          filterText={`Total Delivery Agent Fee. ${filterDisplay}`}
        />
        <StatsCard
          title="Paid to Restaurants"
          value={`₹${metrics.totalRestaurantRevenue}`}
          filterText={`Item purchasePrice * quantity. ${filterDisplay}`}
        />
      </div>

      {/* --- Payout Data --- */}
      <div
        className="payout-sections"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <DeliveryAgentPayout />
        <RestaurantPayout />
      </div>

      {/* --- Raw Orders Display (Optional) --- */}
      <h2 style={{ marginTop: "30px" }}>Orders List ({orders.length} items)</h2>
      <div className="order-cards-container">
        {orders.map((order) => (
          <OrderCard key={order.$id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
