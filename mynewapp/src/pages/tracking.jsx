import React from "react";
import Navbar from "../components/amazon/header";
import { Link } from "react-router-dom";
import '../styles/pages/tracking.css'
function Tracking() {
  return (
    <>
      <Navbar></Navbar>
      <div className="main">
        <div className="order-tracking">
          <Link className="back-to-orders-link link-primary" to={"/orders"}>
            View all orders
          </Link>

          <div className="delivery-date">Arriving on Monday, June 13</div>

          <div className="product-info">
            Black and Gray Athletic Cotton Socks - 6 Pairs
          </div>

          <div className="product-info">Quantity: 1</div>

          <img
            className="product-image"
            src="src/images/products/athletic-cotton-socks-6-pairs.jpg"
          />

          <div className="progress-labels-container">
            <div className="progress-label">Preparing</div>
            <div className="progress-label current-status">Shipped</div>
            <div className="progress-label">Delivered</div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Tracking;
