import React, { useState, useEffect } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";
import {
  Typography,
  Box,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";
import { catagories } from "../../../data/catagory.js";
import api from "../../../api.js";

function ProductForm({ product, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);

  const selectedCategory = catagories.find((cat) => cat.id === category);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    setType("");
    setIsCustomType(false);
    setCustomType("");
    setTypes([]); // Clear types when category changes

    if (category) {
      async function fetchTypes() {
        try {
          const res = await api.get(`/api/types/${category}/`);
          console.log(res.data.results)
          setTypes(res.data.results); // Expecting [{id, name}, ...]
        } catch (error) {
          console.log(error);
        }
      }
      fetchTypes();
    }
  }, [category]);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
      setStockQuantity(
        product.stock_quantity !== undefined && product.stock_quantity !== null
          ? product.stock_quantity
          : ""
      );
      if (product.type) {
        setCategory(product.type.catagory); // set to id
        // Don't set type here!
        setIsCustomType(false);
        setCustomType("");
      } else {
        setCategory("");
        setType("");
        setIsCustomType(false);
        setCustomType("");
      }
      setImage(product.image || null);
    }
  }, [product, catagories]);

  useEffect(() => {
    if (product && product.type && types.length > 0) {
      setType(product.type.id);
      setIsCustomType(false);
      setCustomType("");
    }
  }, [types, product]);

  const handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === "__custom__") {
      setIsCustomType(true);
      setType("");
    } else {
      setIsCustomType(false);
      setType(value); // value is the id
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCategory = catagories.find((cat) => cat.id === category);

    // Validation
    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      alert("Valid product price is required.");
      return;
    }
    if (!category) {
      alert("Category is required.");
      return;
    }
    if (!type && !isCustomType) {
      alert("Type is required.");
      return;
    }
    if (isCustomType && !customType.trim()) {
      alert("Custom type name is required.");
      return;
    }
    if (!stockQuantity || isNaN(stockQuantity) || Number(stockQuantity) < 0) {
      alert("Valid stock quantity is required.");
      return;
    }
    if (!image) {
      alert("Product image is required.");
      return;
    }

    const data = {
      name,
      price,
      stock_quantity: stockQuantity,
      image,
    };

    if (isCustomType) {
      data.catagoryId = selectedCategory.id;
      data.typeName = customType;
    } else if (type) {
      data.typeId = type; // type is the id now
    } else {
      alert("Type selection is invalid.");
      return;
    }

    onSubmit(data);

    // Reset form fields after submission
    setName("");
    setPrice("");
    setImage(null);
    setCategory("");
    setType("");
    setStockQuantity("");
    setCustomType("");
    setIsCustomType(false);
  };

  return (
    <Box className={styled["add-product-form-container"]}>
      <Typography variant="h6" className={styled["form-title"]}>
        {product ? "Edit Product" : "Add New Product"}
      </Typography>
      <form className={styled["add-product-form"]} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          className={styled["form-input"]}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Product Price"
          className={styled["form-input"]}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <FormControl className={styled["form-input"]} fullWidth>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {catagories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          className={styled["form-input"]}
          fullWidth
          disabled={!category}
        >
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={isCustomType ? "__custom__" : type}
            label="Type"
            onChange={handleTypeChange}
            required
          >
            {types.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
            <MenuItem value="__custom__">Add new type...</MenuItem>
          </Select>
        </FormControl>
        {isCustomType && (
          <TextField
            className={styled["form-input"]}
            fullWidth
            label="New Type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            required
          />
        )}
        <input
          type="number"
          placeholder="Stock Quantity"
          className={styled["form-input"]}
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          min={0}
          required
        />
        <div className={styled["file-upload-container"]}>
          <label
            htmlFor="product-image"
            className={styled["file-upload-label"]}
          >
            Upload Product Image
          </label>
          <input
            type="file"
            id="product-image"
            className={styled["file-upload-input"]}
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <div className={styled["form-actions"]}>
          <Button
            variant="contained"
            color="primary"
            className={styled["form-submit-button"]}
            type="submit"
          >
            {product ? "Save Changes" : "Add Product"}
          </Button>
          {product && (
            <Button
              variant="outlined"
              color="secondary"
              className={styled["form-cancel-button"]}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Box>
  );
}

export default ProductForm;
