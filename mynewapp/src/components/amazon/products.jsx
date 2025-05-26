import React, { useContext, useEffect, useState } from "react";
import api from "../../api.js";
import Product from "./product";
import { CircularProgress } from "@mui/material";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function getdata() {
      setLoading(true);
      try {
        let res = await api.get("api/");
        setProducts(res.data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    }
    getdata();
  }, []);

  return loading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress></CircularProgress>{" "}
    </div>
  ) : (
    products.map((product, i) => (
      <Product product={product} i={i} key={i}></Product>
    ))
  );
}

export default Products;
