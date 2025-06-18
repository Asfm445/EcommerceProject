import { Button, TextField, Box, Typography, Paper, Divider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { checkIsAuthorized } from '../authrize';


function Profile() {
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const navigate=useNavigate()
  const [info, setInfo] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    loc_latitude: '',
    loc_longitude: '',
    loc_description:'',
  });

  // Set default location to user's current place
  useEffect(() => {
    if (!location.lat || !location.lng) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setInfo((prev) => ({
            ...prev,
            loc_latitude: pos.coords.latitude,
            loc_longitude: pos.coords.longitude,
          }));
        },
        () => {
          setLocation({ lat: 9.145, lng: 40.4897 });
          setInfo((prev) => ({
            ...prev,
            loc_latitude: 9.145,
            loc_longitude: 40.4897,
          }));
        }
      );
    }
  }, [location.lat, location.lng]);

  // Handlers for manual input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "latitude" || name === "longitude") {
      setLocation((prev) => ({
        ...prev,
        [name === "latitude" ? "lat" : "lng"]: parseFloat(value) || '',
      }));
    }
  };

  function validateEthiopianPhone(phone) {
    // Accepts: +2519XXXXXXXX, 09XXXXXXXX, 9XXXXXXXX (Ethio Telecom & Safaricom)
    const cleaned = phone.replace(/\s+/g, '');
    return (
      /^(\+2519\d{8}|09\d{8}|9\d{8})$/.test(cleaned)
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEthiopianPhone(info.phone_number)) {
      alert("Please enter a valid Ethiopian phone number (Ethio Telecom or Safaricom).");
      return;
    }
    let isAuthorized=await checkIsAuthorized()
    if (!isAuthorized){
      navigate('/login')
      return 
    }
    try{
      let res=await api.post('api/profile/',info)
      if(res.status==202){
        navigate('/')
      }
      console.log(res)
    }catch(error){
      console.log(error)
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 4,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }}
      >
        <Typography variant="h4" align="center" fontWeight={700} mb={1}>
          My Profile
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" mb={2}>
          Update your personal information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="first_name"
            variant="outlined"
            required
            value={info.fname}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="last_name"
            variant="outlined"
            required
            value={info.lname}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            name="phone_number"
            variant="outlined"
            type="tel"
            inputProps={{ maxLength: 15 }}
            value={info.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Location Description (optional)"
            name="loc_description"
            variant="outlined"
            value={info.loc_description || ''}
            onChange={handleChange}
            />
          <TextField
            fullWidth
            margin="normal"
            label="Address"
            name="address"
            variant="outlined"
            value={info.address}
            onChange={handleChange}
          />
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              mb: 2,
              mt: 2,
            }}
          >
            <TextField
              type="number"
              step="any"
              label="Latitude"
              name="loc_latitude"
              value={info.loc_latitude}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              helperText="Add your home latitude. By default, your current location is used."
            />
            <TextField
              type="number"
              step="any"
              label="Longitude"
              name="loc_longitude"
              value={info.loc_longitude}
              onChange={handleChange}
              variant="outlined"
              size="small"
              sx={{ flex: 1 }}
              helperText="Add your home longitude. By default, your current location is used."
            />
            {(info.latitude && info.longitude) && (
              <a
                href={`https://maps.google.com/?q=${info.latitude},${info.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: 8,
                  color: '#1976d2',
                  fontWeight: 500,
                  fontSize: 14,
                  textDecoration: 'underline',
                  whiteSpace: 'nowrap',
                }}
              >
                View Map
              </a>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Please add your <b>home location</b> (latitude and longitude). This helps sellers and delivery services find you easily. If you don't know your coordinates, you can use your current location or check on Google Maps.
          </Typography>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            sx={{ fontWeight: 600, py: 1.2, fontSize: 16, mt: 1 }}
            className="submit"
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Profile;