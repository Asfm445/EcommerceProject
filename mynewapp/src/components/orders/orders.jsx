import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/pages/orders.module.css";
import OrderItem from "./orderItem";
import { format } from "date-fns";
import api from "../../api.js";

// Responsive page size
const getPageSize = () => (window.innerWidth < 600 ? 2 : 6);

function ProductOrders() {
  const [orders, setOrders] = useState([]);
  const [nextOrders, setNextOrders] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [orderItemsNext, setOrderItemsNext] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);

  const ordersFetchLock = useRef(false);
  const orderItemsFetchLock = useRef({});

  // Fetch paginated orders
  const fetchOrders = async (url = null, append = false) => {
    if (ordersFetchLock.current) return;
    ordersFetchLock.current = true;
    setLoadingOrders(true);
    try {
      const pageSize = getPageSize();
      let apiUrl = url || `api/order/?page_size=${pageSize}`;
      if (url) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set("page_size", pageSize);
        apiUrl = urlObj.pathname + urlObj.search;
      }
      let res = await api.get(apiUrl);
      setOrders((prev) => {
        if (append) {
          const ids = new Set(prev.map((o) => o.id));
          const newOrders = res.data.results.filter((o) => !ids.has(o.id));
          return [...prev, ...newOrders];
        } else {
          return res.data.results;
        }
      });
      setNextOrders(res.data.next);
    } catch (error) {
      console.log(error);
    }
    setLoadingOrders(false);
    ordersFetchLock.current = false;
  };

  // Initial orders fetch
  useEffect(() => {
    setOrders([]);
    setNextOrders(null);
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Infinite scroll for orders
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        nextOrders &&
        !loadingOrders &&
        !ordersFetchLock.current
      ) {
        const nextUrl =
          nextOrders.startsWith(window.location.origin)
            ? nextOrders.replace(window.location.origin + "/", "")
            : nextOrders;
        fetchOrders(nextUrl, true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [nextOrders, loadingOrders]);

  // Fetch paginated order items for an order
  const fetchOrderItems = async (orderId, url = null, append = false) => {
    if (orderItemsFetchLock.current[orderId]) return;
    orderItemsFetchLock.current[orderId] = true;
    setLoadingItems(true);
    try {
      const pageSize = getPageSize();
      let apiUrl =
        url ||
        `api/orderitemforbuyer/?order_id=${orderId}&page_size=${pageSize}`;
      if (url) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set("page_size", pageSize);
        apiUrl = urlObj.pathname + urlObj.search;
      }
      let res = await api.get(apiUrl);
      setOrderItems((prev) => {
        if (append) {
          const ids = new Set((prev[orderId] || []).map((i) => i.id));
          const newItems = res.data.results.filter((i) => !ids.has(i.id));
          return { ...prev, [orderId]: [...(prev[orderId] || []), ...newItems] };
        } else {
          return { ...prev, [orderId]: res.data.results };
        }
      });
      setOrderItemsNext((prev) => ({
        ...prev,
        [orderId]: res.data.next,
      }));
    } catch (error) {
      console.log(error);
    }
    setLoadingItems(false);
    orderItemsFetchLock.current[orderId] = false;
  };

  // Handle expand/collapse and fetch first page of order items
  const handleExpand = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderItems[orderId]) {
      fetchOrderItems(orderId);
    }
  };

  // Infinite scroll for order items (when expanded)
  useEffect(() => {
    if (!expandedOrderId) return;
    const box = document.getElementById(`order-items-box-${expandedOrderId}`);
    if (!box) return;
    const handleBoxScroll = () => {
      if (
        box.scrollTop + box.clientHeight >= box.scrollHeight - 40 &&
        orderItemsNext[expandedOrderId] &&
        !loadingItems &&
        !orderItemsFetchLock.current[expandedOrderId]
      ) {
        const nextUrl =
          orderItemsNext[expandedOrderId].startsWith(window.location.origin)
            ? orderItemsNext[expandedOrderId].replace(window.location.origin + "/", "")
            : orderItemsNext[expandedOrderId];
        fetchOrderItems(expandedOrderId, nextUrl, true);
      }
    };
    box.addEventListener("scroll", handleBoxScroll);
    return () => box.removeEventListener("scroll", handleBoxScroll);
    // eslint-disable-next-line
  }, [expandedOrderId, orderItemsNext, loadingItems]);

  return (
    <div className={styles["main"]}>
      <div className={styles["page-title"]}>Your Orders</div>
      <div className={styles["orders-grid"]}>
        {orders.map((order) => (
          <div className={styles["order-container"]} key={order.id}>
            <div
              className={styles["order-header"]}
              onClick={() => handleExpand(order.id)}
            >
              <div className={styles["order-header-left-section"]}>
                <div className={styles["order-date"]}>
                  <div className={styles["order-header-label"]}>Order Placed:</div>
                  <div>
                    {format(new Date(order.created_at), "MMMM d, yyyy h:mm a")}
                  </div>
                </div>
                <div className={styles["order-total"]}>
                  <div className={styles["order-header-label"]}>Total:</div>
                  <div>${order.total}</div>
                </div>
              </div>
              <div className={styles["order-header-right-section"]}>
                <div className={styles["order-header-label"]}>Order ID:</div>
                <div>{order.id}</div>
              </div>
            </div>
            {expandedOrderId === order.id && (
              <div
                id={`order-items-box-${order.id}`}
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "1px solid #eee",
                  marginTop: 10,
                  padding: 10,
                }}
              >
                {orderItems[order.id] &&
                  orderItems[order.id].map((item) => (
                    <OrderItem key={item.id} order={item} />
                  ))}
                {loadingItems && (
                  <div style={{ textAlign: "center", margin: 10 }}>
                    Loading items...
                  </div>
                )}
                {!loadingItems &&
                  orderItems[order.id] &&
                  orderItems[order.id].length === 0 && (
                    <div style={{ textAlign: "center", margin: 10 }}>
                      No items found.
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
        {loadingOrders && (
          <div style={{ textAlign: "center", margin: 20 }}>
            Loading orders...
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductOrders;
