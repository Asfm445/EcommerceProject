import React, { memo, useEffect, useState } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";
import api from "../../../api";
import { checkIsAuthorized } from "../../../authrize";
import { useNavigate } from "react-router-dom";

function OrderItem({ item }) {
  // console.log(item)
  const [status,setStatus]=useState(item.status)
  const navigate=useNavigate();
    async function handleStatusChange(tempStatus){
      let isAuthorized=await checkIsAuthorized();
      if(!isAuthorized){
        navigate("/login")
        return
      }
      try{
        let res= await api.patch('api/orderforseller/',{id:item.id,status:tempStatus})
        if(res.status==202){
          setStatus(tempStatus)
          item.status=tempStatus
        }
      }catch(error){
        console.log(error)
      }
      
    }
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
              handleStatusChange('S')
            }}
          >
            Ship
          </button>
          <button
            className={styled["deliver-button"]}
            disabled={status !== "S"}
            onClick={()=>{
              handleStatusChange("D")
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
