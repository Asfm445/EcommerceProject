import "../styles/shared/general.css";
import Products from "../components/amazon/products";
import { CartContextProvider } from "../data/cart-quantity";
function Amazon() {
  return (
    <>
      <CartContextProvider>
        <Products></Products>
      </CartContextProvider>
    </>
  );
}

export default Amazon;
