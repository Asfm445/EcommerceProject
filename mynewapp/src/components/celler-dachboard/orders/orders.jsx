import React, { useState, useEffect, memo, useRef } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";
import OrderItem from "./orderItems.jsx";
import api from "../../../api.js";
import { checkIsAuthorized } from "../../../authrize.js";
import { useNavigate } from "react-router-dom";

// Helper to calculate distance between two lat/lng points
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null
  )
    return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

const getPageSize = () => (window.innerWidth < 600 ? 2 : 6);

function Orders({ shop }) {
  const [orders, setOrders] = useState([]);
  const [nextOrders, setNextOrders] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const ordersFetchLock = useRef(false); // ADD THIS LINE

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderItemsNext, setOrderItemsNext] = useState(null);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);

  const orderItemsBoxRef = useRef(null);
  const navigate = useNavigate();

  // Fetch paginated orders
  const fetchOrders = async (url = `api/orderforseller/?shop_id=${shop.id}&page_size=${getPageSize()}`, append = false) => {
    if (ordersFetchLock.current) return; // Prevent duplicate fetches
    ordersFetchLock.current = true;
    setLoadingOrders(true);
    try {
      let isAuthorized = await checkIsAuthorized();
      if (!isAuthorized) {
        navigate("/login");
        return;
      }
      let res = await api.get(url);
      if (res.status === 200) {
        setOrders((prev) => {
          if (append) {
            // Filter out duplicates by id
            const ids = new Set(prev.map((o) => o.id));
            const newOrders = res.data.results.filter((o) => !ids.has(o.id));
            return [...prev, ...newOrders];
          } else {
            return res.data.results;
          }
        });
        setNextOrders(res.data.next);
      }
    } catch (error) {
      console.log(error);
    }
    setLoadingOrders(false);
    ordersFetchLock.current = false;
  };

  // Initial orders fetch and on shop change
  useEffect(() => {
    setOrders([]);
    setNextOrders(null);
    fetchOrders();
    // eslint-disable-next-line
  }, [shop.id]);

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
        fetchOrders(nextUrl, true); // append = true
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [nextOrders, loadingOrders]);

  // Fetch paginated order items for expanded order
  const fetchOrderItems = async (orderId, url = null, append = false) => {
    setLoadingOrderItems(true);
    try {
      let isAuthorized = await checkIsAuthorized();
      if (!isAuthorized) {
        navigate("/login");
        return;
      }
      let apiUrl =
        url ||
        `api/orderitemforseller/?shop_id=${shop.id}&&order_id=${orderId}`;
      let res = await api.get(apiUrl);
      if (res.status === 200) {
        setOrderItems((prev) =>
          append ? [...prev, ...res.data.results] : res.data.results
        );
        setOrderItemsNext(res.data.next);
      }
    } catch (error) {
      console.log(error);
    }
    setLoadingOrderItems(false);
  };

  // When expandedOrderId changes, fetch its first page of items
  useEffect(() => {
    setOrderItems([]);
    setOrderItemsNext(null);
    if (expandedOrderId) {
      fetchOrderItems(expandedOrderId);
    }
    // eslint-disable-next-line
  }, [expandedOrderId]);

  // Infinite scroll for order items (inside the scrollable box)
  useEffect(() => {
    const box = orderItemsBoxRef.current;
    if (!box) return;
    const handleBoxScroll = () => {
      if (
        box.scrollTop + box.clientHeight >= box.scrollHeight - 40 &&
        orderItemsNext &&
        !loadingOrderItems
      ) {
        const nextUrl =
          orderItemsNext.startsWith(window.location.origin)
            ? orderItemsNext.replace(window.location.origin + "/", "")
            : orderItemsNext;
        fetchOrderItems(expandedOrderId, nextUrl, true);
      }
    };
    box.addEventListener("scroll", handleBoxScroll);
    return () => box.removeEventListener("scroll", handleBoxScroll);
    // eslint-disable-next-line
  }, [orderItemsNext, loadingOrderItems, expandedOrderId]);

  const toggleOrder = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className={styled["orders-container"]}>
      <h2 style={{ marginBottom: 24, color: "#263238" }}>Orders</h2>
      {Array.isArray(orders) && orders.length === 0 && (
        <div>No orders found.</div>
      )}
      {Array.isArray(orders) &&
        orders.map((order) => {
          const buyerProfile = order.user?.profile || {};
          const distance = getDistanceKm(
            shop.loc_latitude,
            shop.loc_longitude,
            buyerProfile.loc_latitude,
            buyerProfile.loc_longitude
          );
          return (
            <div className={styled["order-card"]} key={order.id}>
              <div
                className={styled["order-header"]}
                onClick={() => toggleOrder(order.id)}
              >
                <h3>Order ID: {order.id}</h3>
                <p>Created At: {new Date(order.created_at).toLocaleDateString()}</p>
                <p>
                  Ordered by:{" "}
                  {`${buyerProfile.first_name}  ${buyerProfile.last_name}`}
                </p>
                <p>
                  address: {`${buyerProfile.address} ${buyerProfile.loc_description}`}
                </p>
                <p>
                  distance to buyer: {distance ? `${distance} km` : "Unknown"}{" "}
                </p>
              </div>
              {expandedOrderId === order.id && (
                <div
                  className={styled["order-items"]}
                  ref={orderItemsBoxRef}
                  style={{
                    maxHeight: 300,
                    overflowY: "auto",
                    border: "1px solid #eee",
                    marginTop: 10,
                    padding: 10,
                  }}
                >
                  {orderItems.map((item) => (
                    <OrderItem item={item} key={item.id}></OrderItem>
                  ))}
                  {loadingOrderItems && (
                    <div style={{ textAlign: "center", margin: 10 }}>
                      Loading...
                    </div>
                  )}
                  {!loadingOrderItems &&
                    orderItems.length === 0 && (
                      <div style={{ textAlign: "center", margin: 10 }}>
                        No items found.
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      {loadingOrders && (
        <div style={{ textAlign: "center", margin: 20 }}>Loading...</div>
      )}
    </div>
  );
}

export default memo(Orders);
