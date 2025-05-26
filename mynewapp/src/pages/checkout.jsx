import React from "react";
import Header from "../components/checkout/header";
import styles from "../styles/pages/checkout/checkout.module.css";
import RenderSummery from "../components/checkout/renderSummery";
import PaymentSummery from "../components/checkout/paymentSummery";
function Checkout() {
  return (
    <>
      <Header></Header>
      <div className={styles["main"]}>
        <div className={styles["page-title"]}>Review your order</div>

        <div className={styles["checkout-grid"]}>
          <div className={styles["order-summary"]}>
            <RenderSummery></RenderSummery>
          </div>

          <div className={styles["payment-summary"]}>
            <PaymentSummery></PaymentSummery>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
