import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, TextField, Button, Switch, FormControlLabel, Divider, Link } from "@mui/material";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { checkIsAuthorized } from "../authrize";

function ShopForm() {
  const navigate=useNavigate()
  const [shop, setShop] = useState({
    shop_name: "",
    loc_latitude: "",
    loc_longitude: "",
    loc_description: "",
    delivery_support: false,
    del_price_per_km: 0.0,
  });

  // Set default location to user's current place
  useEffect(() => {
    if (!shop.loc_latitude || !shop.loc_longitude) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setShop((prev) => ({
            ...prev,
            loc_latitude: pos.coords.latitude,
            loc_longitude: pos.coords.longitude,
          }));
        },
        () => {
          setShop((prev) => ({
            ...prev,
            loc_latitude: 9.145,
            loc_longitude: 40.4897,
          }));
        }
      );
    }
  }, [shop.loc_latitude, shop.loc_longitude]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShop((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isAuthorized=await checkIsAuthorized()
    if(!isAuthorized){
      navigate('\login')
      return
    }
    try{
      let res=await api.post('api/myshops/',shop)
      if (res.status==202){
        navigate('/seller-dashboard')
        return 
      }
      console.log(res)
    }catch(error){
      console.log(error)
    }
    // onSubmit && onSubmit(shop);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        }}
      >
        <Typography variant="h5" align="center" fontWeight={700} mb={1}>
          Create Shop
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Shop Name"
            name="shop_name"
            value={shop.shop_name}
            onChange={handleChange}
            required
          />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              fullWidth
              margin="normal"
              label="Latitude"
              name="loc_latitude"
              type="number"
              step="any"
              value={shop.loc_latitude}
              onChange={handleChange}
              required
              helperText="Shop latitude (default: your current location)"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Longitude"
              name="loc_longitude"
              type="number"
              step="any"
              value={shop.loc_longitude}
              onChange={handleChange}
              required
              helperText="Shop longitude (default: your current location)"
            />
            {(shop.loc_latitude && shop.loc_longitude) && (
              <Link
                href={`https://maps.google.com/?q=${shop.loc_latitude},${shop.loc_longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  ml: 1,
                  color: "#1976d2",
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: "underline",
                  whiteSpace: "nowrap",
                }}
              >
                View Map
              </Link>
            )}
          </Box>
          <TextField
            fullWidth
            margin="normal"
            label="Location Description (optional)"
            name="loc_description"
            value={shop.loc_description}
            onChange={handleChange}
            multiline
            minRows={2}
            helperText="Describe your shop's location in local terms (e.g., 'near Wako Gutu roundabout, Bale Robe')."
          />
          <FormControlLabel
            control={
              <Switch
                checked={shop.delivery_support}
                onChange={handleChange}
                name="delivery_support"
                color="primary"
              />
            }
            label="Supports Delivery"
            sx={{ mt: 2 }}
          />
          {shop.delivery_support && (
            <TextField
              fullWidth
              margin="normal"
              label="Delivery Price per KM"
              name="del_price_per_km"
              type="number"
              step="any"
              value={shop.del_price_per_km}
              onChange={handleChange}
              required
              helperText="Set the delivery price per kilometer."
            />
          )}
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            sx={{ fontWeight: 600, py: 1.2, fontSize: 16, mt: 2 }}
          >
            Create Shop
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default ShopForm;