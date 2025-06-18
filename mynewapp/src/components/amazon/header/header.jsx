import React, { useContext, useEffect, useState } from "react";
import "../../../styles/shared/amazon-header.css";
import searchIcon from "../../../images/icons/search-icon.png";
import cartIcon from "../../../images/icons/cart-icon.png";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../../../data/cart-quantity";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import SideBar from "./sidebar";
import redAppleLogo from '../../../images/logo/red-apple.png'

import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { checkIsAuthorized } from "../../../authrize";

function Navbar(props) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    async function verify() {
      let res = await checkIsAuthorized();
      setIsAuthorized(res);
    }
    verify();
  }, []);

  const ctx = useContext(CartContext);
  let amount = 0;
  ctx.cartProducts.forEach((e) => {
    amount += e.quantity;
  });

  const [anchorEl, setAnchorEl] = useState(null);
  function handleMenuOpen(event) {
    setAnchorEl(event.currentTarget);
  }

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const isLargeScreen = useMediaQuery("(min-width:900px)");

  const handleDrawerOpen = () => setDrawerOpen(true);

  // Add this class to your top-level wrapper
  const pageClass = isLargeScreen && !drawerExpanded ? "drawer-collapsed" : "";

  return (
    <div className={pageClass}>
      <div className="amazon-header">
        <div className="header-left">
          {!isLargeScreen && (
            <IconButton onClick={handleDrawerOpen} className="drawer-menu-btn">
              <MenuIcon style={{ color: "white" }} />
            </IconButton>
          )}
          <Link to={"/"} className="header-logo">
            <img className="amazon-logo" src={redAppleLogo} alt="Amazon Logo" />
            <img
              className="amazon-mobile-logo"
              src={redAppleLogo}
              alt="Amazon Mobile Logo"
            />
          </Link>
        </div>

        <div className="header-middle">
          <input
            className="search-bar"
            type="text"
            placeholder="Search for products"
          />
          <button className="search-button">
            <img className="search-icon" src={searchIcon} alt="Search Icon" />
          </button>
        </div>

        <div className="header-right">
          <Link className="orders-link" to={"/orders"}>
            <span className="returns-text">Returns</span>
            <span className="orders-text">& Orders</span>
          </Link>

          <Link className="cart-link" to={"/checkout"}>
            <img className="cart-icon" src={cartIcon} alt="Cart Icon" />
            <div className="cart-quantity">{amount}</div>
            <div className="cart-text">Cart</div>
          </Link>

          {isAuthorized ? (
            <AccountCircleIcon
              className="account-icon"
              onClick={handleMenuOpen}
            />
          ) : (
            <Button
              variant="contained"
              className="signin-button"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          )}

          <Menu
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                navigate("/seller-dashboard");
              }}
            >
              My Products
            </MenuItem>
            <MenuItem>My Account</MenuItem>
            <MenuItem
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div className="main-content">{props.children}</div>
      <SideBar
        isLargeScreen={isLargeScreen}
        drawerExpanded={drawerExpanded}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setDrawerExpanded={setDrawerExpanded}
        setLoading={props.setLoading}
        setProducts={props.setProducts}
      ></SideBar>
    </div>
  );
}

export default Navbar;
