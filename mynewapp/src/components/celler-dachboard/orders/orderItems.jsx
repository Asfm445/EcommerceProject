import React, { memo, useEffect, useState } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";

function OrderItem({ item }) {
  const [status,setStatus]=useState(item.status)
  useEffect(()=>{
    item.status=status
  },[status])
  return (
    <div className={styled["order-item"]} key={item.id}>
      <div className={styled["item-image-container"]}>
        <img
          src={`http://127.0.0.1:8000/${item.product.image}`}
          alt={item.product.name}
          className={styled["item-image"]}
        />
      </div>
      <div className={styled["item-details"]}>
        <h4>{item.product.name}</h4>
        <p>Quantity: {item.quantity}</p>
        <p>Price: ${item.product.price}</p>
        <p>
          Status:{" "}
          {status === "P"
            ? "Preparing"
            : status === "S"
            ? "Shipped"
            : "Delivered"}
        </p>
        <div className={styled["item-actions"]}>
          <button
            className={styled["ship-button"]}
            disabled={status !== "P"}
            onClick={()=>{
              console.log(status)
              setStatus('S')
            }}
          >
            Ship
          </button>
          <button
            className={styled["deliver-button"]}
            disabled={status !== "S"}
            onClick={()=>{
              setStatus("D")
            }}
          >
            Deliver
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(OrderItem);
