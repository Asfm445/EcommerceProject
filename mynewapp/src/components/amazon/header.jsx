import React, { useContext, useEffect, useState } from "react";
import "../../styles/shared/amazon-header.css";
import mobileLogo from "../../images/amazon-mobile-logo-white.png";
import searchIcon from "../../images/icons/search-icon.png";
import amazonLogo from "../../images/amazon-logo-white.png";
import cartIcon from "../../images/icons/cart-icon.png";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../../data/cart-quantity";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CategoryIcon from "@mui/icons-material/Category";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import InventoryIcon from "@mui/icons-material/Inventory";
import DevicesIcon from "@mui/icons-material/Devices";
import BookIcon from "@mui/icons-material/Book";
import KitchenIcon from "@mui/icons-material/Kitchen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import {
  Button,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { checkIsAuthorized } from "../../authrize";

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
  const [drawerHovered, setDrawerHovered] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width:900px)");

  const computedDrawerWidth = isLargeScreen
    ? drawerExpanded || drawerHovered
      ? 250
      : 60
    : 250;

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
  const [submenuTypes, setSubmenuTypes] = useState([]);

  const [expandedCategory, setExpandedCategory] = useState(null);

  const [typeSearch, setTypeSearch] = useState("");

  const handleCategoryClick = (label) => {
    setExpandedCategory((prev) => (prev === label ? null : label));
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
    setSubmenuTypes([]);
  };

  useEffect(() => {
    setTypeSearch("");
  }, [expandedCategory]);

  // Drawer content
  const categories = [
    {
      icon: <CategoryIcon />,
      label: "Other",
      types: ["Gifts", "Art", "Collectibles"],
    },
    {
      icon: <HomeIcon />,
      label: "Houses",
      types: ["Apartment", "Villa", "Office", "Land"],
    },
    {
      icon: <DirectionsCarIcon />,
      label: "Vehicles",
      types: ["Cars", "Motorcycles", "Bicycles", "Trucks"],
    },
    {
      icon: <MenuBookIcon />,
      label: "Books",
      types: ["Fiction", "Non-fiction", "Comics", "Children"],
    },
    {
      icon: <DevicesIcon />,
      label: "Electronics",
      types: ["Phones", "Laptops", "TVs", "Cameras"],
    },
    {
      icon: <KitchenIcon />,
      label: "Home And Kitchen",
      types: ["Cookware", "Furniture", "Decor", "Appliances"],
    },
    {
      icon: <SchoolIcon />,
      label: "Education Materials",
      types: ["Textbooks", "Stationery", "Lab Equipment"],
    },
    {
      icon: <InventoryIcon />,
      label: "Materials",
      types: ["Wood", "Metal", "Plastic", "Glass"],
    },
    {
      icon: <CheckroomIcon />,
      label: "Clothes",
      types: ["Shirts", "Pants", "Jackets", "Shoes"],
    },
  ];

  const drawerContent = (
    <div
      style={{
        width: computedDrawerWidth,
        transition: "width 0.2s",
        overflowX: "hidden",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
      role="presentation"
    >
      <div style={{ display: "flex", alignItems: "center", padding: "8px" }}>
        <CategoryIcon />
        {(drawerExpanded || !isLargeScreen) && (
          <span style={{ fontWeight: "bold", marginLeft: 8 }}>Categories</span>
        )}
        {isLargeScreen && (
          <IconButton
            size="small"
            onClick={() => setDrawerExpanded((prev) => !prev)}
            style={{ marginLeft: "auto" }}
          >
            {drawerExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </div>
      <List>
        {categories.map((cat) => (
          <React.Fragment key={cat.label}>
            <ListItem
              button
              onClick={() => handleCategoryClick(cat.label)}
              selected={expandedCategory === cat.label}
            >
              <ListItemIcon>{cat.icon}</ListItemIcon>
              {(drawerExpanded || drawerHovered || !isLargeScreen) && (
                <ListItemText primary={cat.label} />
              )}
            </ListItem>
            {/* Show types if this category is expanded */}
            {expandedCategory === cat.label &&
              (drawerExpanded || drawerHovered || !isLargeScreen) && (
                <List component="div" disablePadding>
                  {/* Search bar for types */}
                  <div style={{ padding: "8px 16px" }}>
                    <input
                      type="text"
                      placeholder="Search types..."
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: "0.95em",
                      }}
                    />
                  </div>
                  {cat.types
                    .filter((type) =>
                      type.toLowerCase().includes(typeSearch.toLowerCase())
                    )
                    .map((type) => (
                      <ListItem
                        button
                        key={type}
                        style={{
                          paddingLeft:
                            drawerExpanded || drawerHovered || !isLargeScreen
                              ? 48
                              : 24,
                          fontSize: "0.95em",
                        }}
                        onClick={() => {
                          // handle type click logic here (e.g., filter, navigate)
                          if (!isLargeScreen) handleDrawerClose();
                        }}
                      >
                        <ListItemText primary={type} />
                      </ListItem>
                    ))}
                </List>
              )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

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
            <img className="amazon-logo" src={amazonLogo} alt="Amazon Logo" />
            <img
              className="amazon-mobile-logo"
              src={mobileLogo}
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
      <Drawer
        anchor="left"
        open={isLargeScreen ? true : drawerOpen}
        onClose={handleDrawerClose}
        variant={isLargeScreen ? "permanent" : "temporary"}
        PaperProps={{
          style: {
            width: computedDrawerWidth,
            transition: "width 0.2s",
            overflowX: "hidden",
            top: 0,
            height: "100vh",
            borderRight: "1px solid #eee",
            background: "#fff",
            zIndex: 1200,
          },
          onMouseEnter: () =>
            isLargeScreen && !drawerExpanded && setDrawerHovered(true),
          onMouseLeave: () =>
            isLargeScreen && !drawerExpanded && setDrawerHovered(false),
        }}
      >
        <div
          style={{
            width: computedDrawerWidth,
            transition: "width 0.2s",
            overflowX: "hidden",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
          role="presentation"
        >
          {drawerContent}
        </div>
      </Drawer>
      <Menu
        anchorEl={submenuAnchorEl}
        open={Boolean(submenuAnchorEl)}
        onClose={handleSubmenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {submenuTypes.map((type) => (
          <MenuItem key={type} onClick={handleSubmenuClose}>
            {type}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default Navbar;
