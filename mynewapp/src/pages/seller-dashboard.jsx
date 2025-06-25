import React, { useState, useEffect, useRef } from "react";
import api from "../api.js";
import {find} from '../scripts/utilitis/filter.js'
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

function SellerDashboard() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile,setprofile]=useState({})
  const [nextProducts, setNextProducts] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [nextOrders, setNextOrders] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Add a ref to track initial fetch
  const initialProductsFetched = useRef(false);
  const productsFetchLock = useRef(false);

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

  // Fetch products for selected shop with pagination
  useEffect(() => {
    if (!selectedShop) return;
    let isMounted = true;
    let nextUrl = `api/myproducts/?shop_id=${selectedShop}`;

    const fetchProducts = async (url, append = false) => {
      if (loadingProducts) return;
      setLoadingProducts(true);
      try {
        let res = await api.get(url);
        if (res.status === 200) {
          if (Array.isArray(res.data.results)) {
            if (isMounted) {
              setProducts((prev) =>
                append ? [...prev, ...res.data.results] : res.data.results
              );
              setNextProducts(res.data.next);
              initialProductsFetched.current = true; // Mark as fetched
            }
          } else {
            if (isMounted) {
              setProducts(res.data);
              setNextProducts(null);
              initialProductsFetched.current = true;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoadingProducts(false);
    };

    // Initial fetch
    setProducts([]);
    setNextProducts(null);
    initialProductsFetched.current = false;
    fetchProducts(nextUrl);

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [selectedShop]);

  // Fetch orders for selected shop with pagination
  useEffect(() => {
    if (!selectedShop) return;
    let isMounted = true;
    let nextUrl = `api/orderforseller/?shop_id=${selectedShop}`;

    const fetchOrders = async (url, append = false) => {
      if (loadingOrders) return;
      setLoadingOrders(true);
      try {
        let res = await api.get(url);
        if (res.status === 200) {
          if (Array.isArray(res.data.results)) {
            if (isMounted) {
              setOrders((prev) =>
                append ? [...prev, ...res.data.results] : res.data.results
              );
              setNextOrders(res.data.next);
            }
          } else {
            if (isMounted) {
              setOrders(res.data);
              setNextOrders(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
      setLoadingOrders(false);
    };

    // Initial fetch
    setOrders([]);
    setNextOrders(null);
    fetchOrders(nextUrl);

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [selectedShop]);

  // Infinite scroll handler for both tabs
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
      ) {
        if (
          tabValue === 0 &&
          nextProducts &&
          !loadingProducts &&
          initialProductsFetched.current &&
          !productsFetchLock.current // prevent duplicate fetches
        ) {
          productsFetchLock.current = true; // lock
          const nextPath =
            nextProducts.startsWith(window.location.origin)
              ? nextProducts.replace(window.location.origin + "/", "")
              : nextProducts;
          api.get(nextPath).then(res => {
            if (res.status === 200 && Array.isArray(res.data.results)) {
              setProducts(prev => {
                // Filter out duplicates by id
                const ids = new Set(prev.map(p => p.id));
                const newProducts = res.data.results.filter(p => !ids.has(p.id));
                return [...prev, ...newProducts];
              });
              setNextProducts(res.data.next);
            }
            productsFetchLock.current = false; // unlock
          }).catch(() => {
            productsFetchLock.current = false; // unlock on error
          });
        } else if (tabValue === 1 && nextOrders && !loadingOrders) {
          // Orders tab
          const nextPath =
            nextOrders.startsWith(window.location.origin)
              ? nextOrders.replace(window.location.origin + "/", "")
              : nextOrders;
          // Fetch next orders page
          api.get(nextPath).then(res => {
            if (res.status === 200 && Array.isArray(res.data.results)) {
              setOrders(prev => [...prev, ...res.data.results]);
              setNextOrders(res.data.next);
            }
          });
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [tabValue, nextProducts, loadingProducts, nextOrders, loadingOrders]);

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
              loading={loadingProducts}
            />
          </>
        )}
        {tabValue === 1 && (
          <Orders
            orders={orders}
            shop={find(selectedShop, shops)}
            loading={loadingOrders}
          />
        )}
      </Box>
    </div>
  );
}

export default SellerDashboard;
