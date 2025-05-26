import React, { useContext } from "react";
import styles from "../../styles/pages/checkout/checkout.module.css";
import AuthContext from "../../data/cart-quantity.jsx";
import api from "../../api.js";

function PaymentSummery() {
  const ctx = useContext(AuthContext);
  let totalItemsPrice = 0;
  ctx.cartProducts.forEach((item) => {
    totalItemsPrice += item.quantity * item.product.price;
  });
  let tax = Number((totalItemsPrice * 0.1).toFixed(2));

  return (
    <>
      <div className={styles["payment-summary-title"]}>Order Summary</div>
      <div className={styles["payment-summary-row"]}>
        <div>Items ({ctx.cartProducts.length}):</div>
        <div className={styles["payment-summary-money"]}>
          ${totalItemsPrice}
        </div>
      </div>
      <div
        className={`${styles["payment-summary-row"]} ${styles["subtotal-row"]}`}
      >
        <div>Total before tax:</div>
        <div className={styles["payment-summary-money"]}>
          ${totalItemsPrice}
        </div>
      </div>
      <div className={styles["payment-summary-row"]}>
        <div>Estimated tax (10%):</div>
        <div className={styles["payment-summary-money"]}>${tax}</div>
      </div>
      <div
        className={`${styles["payment-summary-row"]} ${styles["total-row"]}`}
      >
        <div>Order total:</div>
        <div className={styles["payment-summary-money"]}>
          ${totalItemsPrice + tax}
        </div>
      </div>
      <button
        className={`${styles["place-order-button"]} ${styles["button-primary"]}`}
        onClick={async () => {
          try {
            let res = await api.post("api/order/", {});
            if (res.status == 201) {
              ctx.setCartProducts([]);
            } else if (res.status == 400) {
              alert(res.data.message);
            }
          } catch (error) {
            console.log(error);
          }
        }}
      >
        Place your order
      </button>
    </>
  );
}

export default PaymentSummery;
