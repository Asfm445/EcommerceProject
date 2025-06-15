import React, { useContext } from "react";
import styles from "../../styles/pages/orders.module.css";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import OrderContext from "../../data/order-context";

function OrderItem(props) {
  const ctx = useContext(OrderContext);
  return (
    <div className={styles["order-details-grid"]}>
      <div className={styles["product-image-container"]}>
        <img src={`http://127.0.0.1:8000/${props.order.product.image}`} />
      </div>

      <div className={styles["product-details"]}>
        <div className={styles["product-name"]}>{props.order.product.name}</div>
        <div className={styles["product-delivery-date"]}>
          Arriving on: August 15
        </div>
        <div className={styles["product-quantity"]}>
          Quantity: {props.order.quantity}
        </div>
        <button
          className={`${styles["buy-again-button"]} ${styles["button-primary"]}`}
        >
          <img
            className={styles["buy-again-icon"]}
            src="src/images/icons/buy-again.png"
          />
          <span onClick={ctx.check} className={styles["buy-again-message"]}>
            Buy it again
          </span>
        </button>
      </div>

      <div className={styles["product-actions"]}>
        <Link
          to="/tracking"
          state={{ order: props.order }}
        >
          <button
            className={`${styles["track-package-button"]} ${styles["button-secondary"]}`}
          >
            Track package
          </button>
        </Link>
      </div>
    </div>
  );
}

export default OrderItem;
