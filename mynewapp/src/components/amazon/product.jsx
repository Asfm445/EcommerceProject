import React, { useContext, useState } from "react";
import GenerateOption from "./generateOPtion";
import styles from "../../styles/pages/amazon.module.css";
import CartContext from "../../data/cart-quantity";

function Product(props) {
  const ctx = useContext(CartContext);
  let item = ctx.cartProducts.filter((e) => e.id === props.product.id);
  let startAmount = 1;
  if (item.length > 0) {
    startAmount = item[0].Quantity;
  }
  const [ItemQuantity, setItemQuantity] = useState(startAmount);
  const [hide, setHide] = useState(styles["added-to-cart"]);
  function hideAdded() {
    setHide(styles["added-to-cart"] + " " + styles["visible"]);
    setTimeout(() => {
      setHide(styles["added-to-cart"]);
    }, 1000);
  }

  return (
    <div className={`${styles["product-container"]}`}>
      <div className={styles["product-image-container"]}>
        {props.product?.image && (
          <img
            className={styles["product-image"]}
            src={`${props.product.image}`}
            alt={props.product.name || "Product"}
          />
        )}
      </div>
      <div
        className={`${styles["product-name"]}  ${styles["limit-text-to-2-lines"]}`}
      >
        {props.product.name}
      </div>
      <div
        className={`${styles["product-price"]} ${styles["add-to-cart-notification"]}`}
      >
        ${props.product.price}
      </div>
      <div className={styles["product-quantity-container"]}>
        <select
          id={props.product.id}
          className={styles[`sel-${props.product.id}`]}
          value={ItemQuantity}
          onChange={(e) => {
            setItemQuantity(Number(e.target.value));
          }}
        >
          <GenerateOption></GenerateOption>
        </select>
      </div>
      <div className={styles["product-spacer"]}></div>
      <div className={hide}>
        <img src="src/images/icons/checkmark.png" />
        Added
      </div>
      <button
        className={`${styles["add-to-cart-button"]} ${styles["button-primary"]}`}
        id={props.i}
        onClick={() => {
          hideAdded();
          ctx.handleCartChange(props.product, ItemQuantity);
        }}
      >
        Add to Cart
      </button>
    </div>
  );
}

export default Product;
