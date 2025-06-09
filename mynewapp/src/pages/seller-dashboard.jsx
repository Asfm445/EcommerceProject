import React, { useState, useEffect } from "react";
import api from "../api.js";
import { transform } from "../components/celler-dachboard/transform.js";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { checkIsAuthorized } from "../authrize.js";
import styled from "../styles/pages/seller-dashboard.module.css";
import Orders from "../components/celler-dachboard/orders/orders.jsx";
import ProductForm from "../components/celler-dachboard/products/productform.jsx";
import Products from "../components/celler-dachboard/products/Products.jsx";
import { useNavigate } from "react-router-dom";

function SellerDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    async function fetchProducts() {
      try {
        let res = await api.get("api/myproducts/");
        if (res.status == 200) {
          console.log(res.data);
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);
  useEffect(() => {
    async function fetchProducts() {
      try {
        let res = await api.get("api/orderforseller/");
        if (res.status == 200) {
          console.log(transform(res.data));
          setOrders(transform(res.data));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);
  async function handleOnSubmit(data) {
    console.log(data);
    // Convert plain object to FormData if there's an image (file)
    let formData;
    if (data.image) {
      formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
    }

    let isAuthorized = await checkIsAuthorized();
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    try {
      let config = {};
      if (formData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }
      console.log(formData);
      let res = await api.post(
        "api/myproducts/",
        formData ? formData : data,
        config
      );
      if (res.status == 201) {
        setProducts((prev) => [...prev, res.data]);
      } else {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function handleDeleteButton(productId) {
    console.log(productId)
    let isAuthorized = await checkIsAuthorized();
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    let ob = { productId: productId }
    console.log(ob)
    try {
      let res = await api.delete(`api/delete/product/?productId=${productId}`)
      if (res.status == 204) {
        setProducts((prev) => {
          return (prev.filter((e) => {
            if (e.id != productId) {
              return e
            }
          }))
        })
      }
    } catch (error) {
      alert(error)
    }
  }
  return (
    <div className={styled["seller-dashboard"]}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Seller Dashboard
          </Typography>
          <Button color="inherit">Logout</Button>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        className={styled["dashboard-tabs"]}
      >
        <Tab label="Products" />
        <Tab label="Orders" />
      </Tabs>

      {/* Tab Content */}
      <Box className={styled["tab-content"]}>
        {tabValue === 0 && (
          <>
            {/* Add Product Form */}
            <ProductForm onSubmit={handleOnSubmit}></ProductForm>
            <Products products={products} handleDeleteButton={handleDeleteButton}></Products>
          </>
        )}

        {tabValue === 1 && <Orders orders={orders}></Orders>}
      </Box>
    </div>
  );
}

export default SellerDashboard;
