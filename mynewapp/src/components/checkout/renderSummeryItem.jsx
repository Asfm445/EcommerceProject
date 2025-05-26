import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/pages/checkout/Checkout.module.css";
import CartContext from "../../data/cart-quantity.jsx";

function RenderSummeryItem(props) {
  const ctx = useContext(CartContext);
  let v = props.v;
  const [itemQuantity, setItemQuantity] = useState(v.quantity);
  const [classes, setClasses] = useState({
    inputClass: `${styles["quantity-update-input"]} ${styles["hide"]} ${
      styles[`update-input-${v.id}`]
    }`,
    type: true,
  });

  return (
    <div
      className={`${styles["cart-item-container"]} ${
        styles[`container-${v.id}`]
      }`}
    >
      <div className={styles["cart-item-details-grid"]}>
        <img
          className={styles["product-image"]}
          src={`http://127.0.0.1:8000/${v.product.image}`}
          alt={v.product.name}
        />

        <div className={styles["cart-item-details"]}>
          <div className={styles["product-name"]}>{v.product.name}</div>
          <div className={styles["product-price"]}>{v.product.price}</div>
          <div
            className={`${styles["product-quantity"]} ${
              styles[`product-quantity-${v.product.id}`]
            }`}
          >
            <span>
              Quantity:{" "}
              <span
                className={`${styles["quantity-label"]} ${
                  styles[`quantity-${v.quantity}`]
                }`}
              >
                {classes.type ? itemQuantity : ""}
              </span>
            </span>
            <input
              type="number"
              className={classes.inputClass}
              value={itemQuantity}
              onChange={(e) => {
                setItemQuantity(e.target.value);
              }}
              name="update"
            />
            <span
              className={`${styles["update-quantity-link"]} ${styles["link-primary"]}`}
              onClick={(e) => {
                if (!classes.type) {
                  // ctx.check();
                  ctx.handleCartChange(v.product, Number(itemQuantity));
                }
                setClasses((prev) => {
                  if (prev.type) {
                    return {
                      inputClass: `${styles["quantity-update-input"]} ${
                        styles[`update-input-${v.id}`]
                      }`,
                      type: false,
                    };
                  } else {
                    return {
                      inputClass: `${styles["quantity-update-input"]} ${
                        styles["hide"]
                      } ${styles[`update-input-${v.id}`]}`,
                      type: true,
                    };
                  }
                });
              }}
            >
              {classes.type ? "Update" : "save"}
            </span>
            <span
              className={`${styles["delete-quantity-link"]} ${
                styles["link-primary"]
              } ${styles["delete-link"]} ${styles[`delete-link-${v.id}`]}`}
              id={v.id}
              onClick={(e) => {
                ctx.deleteFromCart(v.product.id);
              }}
            >
              Delete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RenderSummeryItem;
