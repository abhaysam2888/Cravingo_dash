import React from "react";

const DUMMY_RESTAURANTS = [
  {
    id: "rest-201",
    name: "The Spice Hub",
    revenueDue: 8520.0,
    lastPaid: "2025-12-14",
  },
  {
    id: "rest-202",
    name: "Biryani King",
    revenueDue: 12150.75,
    lastPaid: "2025-12-10",
  },
  {
    id: "rest-203",
    name: "Pizza Planet",
    revenueDue: 4500.5,
    lastPaid: "2025-12-15",
  },
];

const RestaurantPayout = () => {
  return (
    <div className="card">
      <h3>🍽️ Payouts to Restaurants (DUMMY)</h3>
      <table className="payout-table">
        <thead>
          <tr>
            <th>Restaurant ID</th>
            <th>Name</th>
            <th>Total Revenue Due</th>
            <th>Last Paid</th>
          </tr>
        </thead>
        <tbody>
          {DUMMY_RESTAURANTS.map((restaurant) => (
            <tr key={restaurant.id}>
              <td>{restaurant.id}</td>
              <td>{restaurant.name}</td>
              <td>₹{restaurant.revenueDue.toFixed(2)}</td>
              <td>{restaurant.lastPaid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RestaurantPayout;
