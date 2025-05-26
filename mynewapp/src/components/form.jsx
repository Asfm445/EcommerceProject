import React, { useContext, useState } from "react";
import "../styles/form.css";
import { Link, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Button, Typography } from "@mui/material";
// import { handleForm } from "../api";
import api from "../api";
function Form(props) {
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  function handleChange(e) {
    props.setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value, // Use square brackets here
    }));
  }
  async function handleSubmit(e) {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post(props.apiUrl, props.inputs);
      if (props.type === "Login") {
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="forms">
      <form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center" }}>{props.type} here</h2>
        <input
          type="text"
          name="username"
          placeholder="username"
          onChange={handleChange}
          value={props.inputs.username}
        />
        {props.type === "Register" && (
          <input
            type="email"
            name="email"
            placeholder="email"
            value={props.inputs.email}
            onChange={handleChange}
          />
        )}
        <input
          type="password"
          name="password"
          placeholder="password"
          value={props.inputs.password}
          onChange={handleChange}
        />
        {error && (
          <Typography variant="p" color="error">
            {error}
          </Typography>
        )}
        <Button type="submit" className="submit">
          {props.type}
        </Button>
        {loading && (
          <Box sx={{ display: "flex", alignSelf: "center" }}>
            <CircularProgress />
          </Box>
        )}
        {props.type === "Login" ? (
          <p className="link" style={{ display: "flex", gap: "5px" }}>
            don't have account? <Link to={"/register"}>register here</Link>
          </p>
        ) : (
          <p className="link" style={{ display: "flex", gap: "5px" }}>
            have account? <Link to={"/login"}>login here</Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Form;
