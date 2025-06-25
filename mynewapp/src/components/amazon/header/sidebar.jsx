import {
  Drawer,
  Menu,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import CategoryIcon from "@mui/icons-material/Category";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import InventoryIcon from "@mui/icons-material/Inventory";
import DevicesIcon from "@mui/icons-material/Devices";
import KitchenIcon from "@mui/icons-material/Kitchen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import api from "../../../api.js";

function SideBar({
  isLargeScreen,
  drawerOpen,
  drawerExpanded,
  setDrawerOpen,
  setDrawerExpanded,
  setLoading,
  setProducts,
}) {
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
  const [submenuTypes, setSubmenuTypes] = useState([]);
  const [drawerHovered, setDrawerHovered] = useState(false);
  const computedDrawerWidth = isLargeScreen
    ? drawerExpanded || drawerHovered
      ? 250
      : 60
    : 250;
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleCategoryClick = (label) => {
    setExpandedCategory((prev) => (prev === label ? null : label));
  };
  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
    setSubmenuTypes([]);
  };
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [typeSearch, setTypeSearch] = useState("");
  const categories = [
    {
      id: 1,
      icon: <CheckroomIcon />,
      label: "Clothes",
    },
    {
      id: 4,
      icon: <KitchenIcon />,
      label: "Home And Kitchen",
    },
    {
      id: 2,
      icon: <InventoryIcon />,
      label: "Materials",
    },
    {
      id: 3,
      icon: <SchoolIcon />,
      label: "Education Materials",
    },
    {
      id: 5,
      icon: <DevicesIcon />,
      label: "Electronics",
    },
    {
      id: 6,
      icon: <MenuBookIcon />,
      label: "Books",
    },
    {
      id: 7,
      icon: <HomeIcon />,
      label: "Houses",
    },
    {
      id: 9,
      icon: <DirectionsCarIcon />,
      label: "Vehicles",
    },
    {
      id: 8,
      icon: <CategoryIcon />,
      label: "Other",
    },
  ];
  useEffect(() => {
    setTypeSearch("");
    async function fetchTypes() {
      try {
        let res = await api.get(`api/types/${expandedCategory}/`);
        if (res.status == 200) {
          console.log(res.data);
          setTypes(res.data.results);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (expandedCategory != null) fetchTypes();
  }, [expandedCategory]);

  const [types, setTypes] = useState([]);

  async function handleTypeClick(typeId) {
    try {
      setLoading(true);
      let res = await api.get(`api/?type_id=${typeId}`);
      if (res.status == 200) {
        setProducts(res.data.results);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

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
              onClick={() => handleCategoryClick(cat.id)}
              selected={expandedCategory === cat.id}
            >
              <ListItemIcon>{cat.icon}</ListItemIcon>
              {(drawerExpanded || drawerHovered || !isLargeScreen) && (
                <ListItemText primary={cat.label} />
              )}
            </ListItem>
            {/* Show types if this category is expanded */}
            {expandedCategory === cat.id &&
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
                  {types &&
                    types
                      .filter((type) =>
                        type.name
                          .toLowerCase()
                          .includes(typeSearch.toLowerCase())
                      )
                      .map((type) => (
                        <ListItem
                          button
                          key={type.id}
                          style={{
                            paddingLeft:
                              drawerExpanded || drawerHovered || !isLargeScreen
                                ? 48
                                : 24,
                            fontSize: "0.95em",
                          }}
                          onClick={() => {
                            handleTypeClick(type.id);
                            if (!isLargeScreen) handleDrawerClose();
                          }}
                        >
                          <ListItemText primary={type.name} />
                        </ListItem>
                      ))}
                </List>
              )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );
  return (
    <>
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
    </>
  );
}

export default SideBar;
