import React, { useState } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";
import ProductForm from "./productform.jsx";
import { Modal, Box } from "@mui/material";
import api from "../../../api.js";
import { checkIsAuthorized } from "../../../authrize.js";
import { useNavigate } from "react-router-dom";

const getPageSize = () => (window.innerWidth < 600 ? 2 : 6);

function Products({ products, handleDeleteButton, setProducts }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (data) => {
    console.log("Updated Product Data:", data);
    let formData = new FormData();
    formData.append("id", selectedProduct.id);
    for (const key in data) {
      console.log(key == "image");
      if (key != "image" || typeof data[key] != "string")
        formData.append(key, data[key]);
    }

    try {
      let config = {};
      config.headers = { "Content-Type": "multipart/form-data" };
      let res = await api.patch(`api/myproducts/?page_size=${getPageSize()}`, formData, config);
      console.log(res);
      if (res.status == 202) {
        console.log(selectedProduct);
        setProducts((prev) => {
          return prev.map((product) => {
            if (product.id == selectedProduct.id) {
              return res.data;
            }
            return product;
          });
        });
      }
    } catch (error) {
      console.log(error);
    }
    handleCloseModal();
  };

  return (
    <div className={styled["products-grid"]}>
      {products.map((product) => (
        <div className={styled["product-container"]} key={product.id}>
          <div className={styled["product-image-container"]}>
            <img
              src={product.image}
              alt={product.name}
              className={styled["product-image"]}
            />
          </div>
          <div className={styled["product-details"]}>
            <h3 className={styled["product-name"]}>{product.name}</h3>
            <p className={styled["product-price"]}>${product.price}</p>
            <p>stock quantity {product.stock_quantity}</p>
          </div>
          <div className={styled["product-actions"]}>
            <button
              className={styled["edit-button"]}
              onClick={async () => {
                let isAuthorized = await checkIsAuthorized();
                if (!isAuthorized) {
                  navigate("/login");
                  return;
                }
                handleEdit(product);
              }}
            >
              Edit
            </button>
            <button
              className={styled["delete-button"]}
              onClick={async () => {
                let isAuthorized = await checkIsAuthorized();
                if (!isAuthorized) {
                  navigate("/login");
                  return;
                }
                handleDeleteButton(product.id);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Modal for Editing Product */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box className={styled["modal-box"]}>
          <ProductForm
            product={selectedProduct}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        </Box>
      </Modal>
    </div>
  );
}

export default Products;
