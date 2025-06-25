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
import SellerDashboard from "./pages/seller-dashboard";
import Profile from "./pages/profile";
import ShopForm from "./pages/createshop";
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
                <Orders />
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
        <Route path="/profile" element={<Profile></Profile>}/>
        <Route path="/createshop" element={<ShopForm></ShopForm>}></Route>
      </Routes>
    </>
  );
}

export default App;
