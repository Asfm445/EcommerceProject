import React, { useState, useEffect } from "react";
import { checkIsAuthorized } from "../authrize";
import api from "../api.js";
import { se } from "date-fns/locale";

const OrderContext = React.createContext({
  orders: [],
  setOrders: () => {},
  orderLoading: false,
});

export const OrderContextProvider = (props) => {
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  useEffect(() => {
    async function getOrders() {
      setOrderLoading(true);
      let tempIsAuthorized = await checkIsAuthorized();
      if (!tempIsAuthorized) {
        return;
      }
      try {
        let res = await api.get("api/order/");
        if (res.status == 200) {
          setOrders(res.data);
        } else if (res.status == 404) {
          setOrders([]);
        }
      } catch (error) {
        console.log(error);
      }
      setOrderLoading(false);
    }
    getOrders();
  }, []);
  function check() {
    console.log("it works");
  }
  return (
    <OrderContext.Provider value={{ orders, setOrders, orderLoading, check }}>
      {props.children}
    </OrderContext.Provider>
  );
};
export default OrderContext;
