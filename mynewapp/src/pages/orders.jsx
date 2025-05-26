import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/amazon/header";
import ProductOrders from "../components/orders/orders";
import { CircularProgress } from "@mui/material";
import OrderContext from "../data/order-context";
import styles from "../styles/pages/orders.module.css";
import { CartContextProvider } from "../data/cart-quantity";
function Orders() {
  const ctx = useContext(OrderContext);

  return (
    <>
      <CartContextProvider>
        <Navbar>
          {ctx.orderLoading ? (
            <div
              className="loading"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100vh",
              }}
            >
              <CircularProgress></CircularProgress>
            </div>
          ) : ctx.orders.length == 0 ? (
            <div
              className={styles["no-orders"]}
              // style={{ textAlign: "center", marginTop: "20px" }}
            >
              No Orders
            </div>
          ) : (
            ctx.orders.map((order) => {
              return <ProductOrders key={order.id} order={order} />;
            })
          )}
        </Navbar>
      </CartContextProvider>
    </>
  );
}

export default Orders;
