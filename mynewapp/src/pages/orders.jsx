
import Navbar from "../components/amazon/header/header";
import ProductOrders from "../components/orders/orders";
import { CartContextProvider } from "../data/cart-quantity";
function Orders() {

  return (
    <>
      <CartContextProvider>
        <Navbar>
          <ProductOrders></ProductOrders>
        </Navbar>
      </CartContextProvider>
    </>
  );
}

export default Orders;
