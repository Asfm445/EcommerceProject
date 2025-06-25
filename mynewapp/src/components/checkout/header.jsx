import React, { useContext } from "react";
import styles from "../../styles/pages/checkout/checkout-header.module.css";
import { Link } from "react-router-dom";
import CartContext from "../../data/cart-quantity";

function Header() {
  const ctx = useContext(CartContext);
  const itemCount = ctx.cartProducts.length;

  return (
    <header className={styles["checkout-header"]}>
      <nav
        className={styles["header-content"]}
        aria-label="Checkout Navigation"
      >
        <div className={styles["checkout-header-left-section"]}>
          <Link to="/" aria-label="Back to home">
            <img
              className={styles["amazon-logo"]}
              src="src/images/logo/red-apple.png"
              alt="red-apple"
            />
            <img
              className={styles["amazon-mobile-logo"]}
              src="src/images/logo/red-apple.png"
              alt="red-apple"
            />
          </Link>
        </div>

        <div className={styles["checkout-header-middle-section"]}>
          <span className={styles["checkout-step"]}>Checkout</span>
          <span className={styles["checkout-items"]}>
            (
            <Link className={styles["return-to-home-link"]} to="/">
              <strong>{itemCount}</strong> {itemCount === 1 ? "item" : "items"}
            </Link>
            )
          </span>
        </div>

        <div className={styles["checkout-header-right-section"]}>
          <img
            src="src/images/icons/checkout-lock-icon.png"
            alt="Secure Checkout"
            title="Secure Checkout"
            aria-label="Secure Checkout"
            className={styles["checkout-lock-icon"]}
          />
        </div>
      </nav>
    </header>
  );
}

export default Header;
