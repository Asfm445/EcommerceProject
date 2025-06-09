import React, { useState, useEffect, memo } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";
import OrderItem from "./orderItems.jsx";
function Orders({ orders }) {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const toggleOrder = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };
  return (
    <div className={styled["orders-container"]}>
      {orders.map((order) => (
        <div className={styled["order-card"]} key={order.id}>
          <div
            className={styled["order-header"]}
            onClick={() => toggleOrder(order.id)}
          >
            <h3>Order ID: {order.id}</h3>
            <p>Created At: {new Date(order.created_at).toLocaleDateString()}</p>
            <p>Ordered by: {order.username}</p>
          </div>
          {expandedOrderId === order.id && (
            <div className={styled["order-items"]}>
              {order.items.map((item) => (
                <OrderItem item={item} key={item.id}></OrderItem>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default memo(Orders);
