import { Route, Routes } from "react-router-dom";
import "./App.css";
import Amazon from "./pages/amazon";
import Checkout from "./pages/checkout";
import Orders from "./pages/orders";
import Tracking from "./pages/tracking";
import ProtectedRoute from "./components/protectedRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import { CartContextProvider } from "./data/cart-quantity";
import { OrderContextProvider } from "./data/order-context";
import SellerDashboard from "./pages/seller-dashboard";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Amazon />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CartContextProvider>
                <Checkout />
              </CartContextProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderContextProvider>
                <Orders />
              </OrderContextProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute>
              <SellerDashboard></SellerDashboard>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
