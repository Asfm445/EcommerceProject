import React, { useState, useEffect, useContext } from "react";
import styles from "../../styles/pages/orders.module.css";
import OrderItem from "./orderItem";
import { format } from "date-fns";


function ProductOrders(props) {
  let date = new Date(props.order.created_at);

  return (
    <div className={styles["main"]}>
      <div className={styles["page-title"]}>Your Orders</div>

      <div className={styles["orders-grid"]}>
        <div className={styles["order-container"]}>
          <div className={styles["order-header"]}>
            <div className={styles["order-header-left-section"]}>
              <div className={styles["order-date"]}>
                <div className={styles["order-header-label"]}>
                  Order Placed:
                </div>
                <div>{format(date, "MMMM d, yyyy h:mm a")}</div>
              </div>
              <div className={styles["order-total"]}>
                <div className={styles["order-header-label"]}>Total:</div>
                <div>${props.order.total}</div>
              </div>
            </div>

            {/* <div className={styles["order-header-right-section"]}>
              <div className={styles["order-header-label"]}>Order ID:</div>
              <div>27cba69d-4c3d-4098-b42d-ac7fa62b7664</div>
            </div> */}
          </div>
          {props.order.order_items.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductOrders;
