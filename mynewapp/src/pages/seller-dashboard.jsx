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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { checkIsAuthorized } from "../authrize.js";
import styled from "../styles/pages/seller-dashboard.module.css";
import Orders from "../components/celler-dachboard/orders/orders.jsx";
import ProductForm from "../components/celler-dachboard/products/productform.jsx";
import Products from "../components/celler-dachboard/products/Products.jsx";
import { useNavigate } from "react-router-dom";
import ShopForm from "./createshop.jsx";

function SellerDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile,setprofile]=useState({})

  //Fetch shops on mount
  useEffect(() => {
    async function fetchShops() {
      let isAuthorized=await checkIsAuthorized()
      if(!isAuthorized){
        navigate('/login')
        return
      }
      try{
        let res2=await api.get('api/profile/')
        if(res2.status==200){
          setprofile(res2.data)
          console.log(res2.data)
        }
      }catch(error){
        if(error.status==404){
          navigate("/profile")
        }
      }
      try {
        let res = await api.get("api/myshops/");
        if (res.status === 200 && res.data.length > 0) {
          setShops(res.data);
          setSelectedShop(res.data[0].id); // Select first shop by default
        } else if (res.data.length == 0) {
          navigate("/createshop");
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    }
    fetchShops();
  }, []);

  // Fetch products for selected shop
  useEffect(() => {
    if (!selectedShop) return;
    async function fetchProducts() {
      try {
        let res = await api.get(`api/myproducts/?shop_id=${selectedShop}`);
        if (res.status === 200) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, [selectedShop]);

  // Fetch orders for selected shop
  useEffect(() => {
    if (!selectedShop) return;
    async function fetchOrders() {
      try {
        let res = await api.get(`api/orderforseller/?shop_id=${selectedShop}`);
        if (res.status === 200) {
          console.log(res.data)
          setOrders(transform(res.data));
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
    fetchOrders();
  }, [selectedShop]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleShopChange = (event) => {
    const value = event.target.value;
    if (value === "add_new") {
      navigate("/createshop");
    } else {
      setSelectedShop(value);
    }
  };

  async function handleOnSubmit(data) {
    // Attach selected shop to product data
    data.shop_id = selectedShop;
    console.log(data);
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
      let res = await api.post(
        "api/myproducts/",
        formData ? formData : data,
        config
      );
      if (res.status === 201) {
        setProducts((prev) => [...prev, res.data]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteButton(productId) {
    let isAuthorized = await checkIsAuthorized();
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    try {
      let res = await api.delete(`api/myproducts/?productId=${productId}`);
      if (res.status === 204) {
        setProducts((prev) => prev.filter((e) => e.id !== productId));
      }
    } catch (error) {
      alert(error);
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

      {/* Shop Selector */}
      <Box sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "center" }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="shop-select-label">Select Shop</InputLabel>
          <Select
            labelId="shop-select-label"
            value={selectedShop}
            label="Select Shop"
            onChange={handleShopChange}
          >
            {shops.map((shop) => (
              <MenuItem key={shop.id} value={shop.id}>
                {shop.shop_name}
              </MenuItem>
            ))}
            <MenuItem
              value="add_new"
              sx={{ fontWeight: 600, color: "primary.main" }}
            >
              + Add New Shop
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

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
            <ProductForm onSubmit={handleOnSubmit} />
            <Products
              products={products}
              setProducts={setProducts}
              handleDeleteButton={handleDeleteButton}
            />
          </>
        )}
        {tabValue === 1 && <Orders orders={orders} />}
      </Box>
    </div>
  );
}

export default SellerDashboard;
