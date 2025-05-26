import React, { useState } from "react";
import styled from "../../../styles/pages/seller-dashboard.module.css";
import ProductForm from "./productform.jsx";
import { Modal, Box } from "@mui/material";

function Products({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleFormSubmit = (formData) => {
    console.log("Updated Product Data:", formData);
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
          </div>
          <div className={styled["product-actions"]}>
            <button
              className={styled["edit-button"]}
              onClick={() => handleEdit(product)}
            >
              Edit
            </button>
            <button className={styled["delete-button"]}>Delete</button>
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
