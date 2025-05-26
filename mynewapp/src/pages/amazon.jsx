import React from "react";
import Navbar from "../components/amazon/header";
import styles from "../styles/pages/amazon.module.css";
import "../styles/shared/general.css";
import Products from "../components/amazon/products";
import { CartContextProvider } from "../data/cart-quantity";
function Amazon() {
  // console.log(styles)
  return (
    <>
      <CartContextProvider>
        <Navbar>
          <div className={styles["main"]}>
            <div className={styles["products-grid"]}>
              <Products></Products>
            </div>
          </div>
        </Navbar>
      </CartContextProvider>
    </>
  );
}

export default Amazon;
