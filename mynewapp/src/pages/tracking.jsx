import React from "react";
import Navbar from "../components/amazon/header/header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/pages/tracking.css";

function Tracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // If user navigates directly, order will be undefined
  if (!order) {
    // Optionally redirect or show a message
    navigate("/orders");
    return null;
  }

  // Example: status and progress logic (customize as needed)
  const status = order.status || "Preparing"; // or "Shipped", "Delivered"
  const progressWidth =
    status === "Preparing" ? "33%" : status === "Shipped" ? "66%" : "100%";

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to={"/orders"}>
            &larr; View all orders
          </Link>

          <div className="delivery-date">
            {/* You can use order.estimated_delivery or similar */}
            Arriving on: {order.estimated_delivery || "Unknown"}
          </div>

          <div className="product-info">{order.product.name}</div>
          <div className="product-info">Quantity: {order.quantity}</div>

          <img
            className="product-image"
            src={`http://127.0.0.1:8000/${order.product.image}`}
            alt={order.product.name}
          />

          <div className="progress-labels-container">
            <div
              className={`progress-label${
                status === "Preparing" ? " current-status" : ""
              }`}
            >
              Preparing
            </div>
            <div
              className={`progress-label${
                status === "Shipped" ? " current-status" : ""
              }`}
            >
              Shipped
            </div>
            <div
              className={`progress-label${
                status === "Delivered" ? " current-status" : ""
              }`}
            >
              Delivered
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: progressWidth }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Tracking;
