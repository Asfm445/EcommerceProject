import React, { useEffect, useState, useRef } from "react";
import api from "../../api.js";
import Product from "./product";
import { CircularProgress } from "@mui/material";
import Navbar from "./header/header.jsx";
import styles from "../../styles/pages/amazon.module.css";

// Responsive page size
const getPageSize = () => (window.innerWidth < 600 ? 2 : 6);

function Products() {
  const [products, setProducts] = useState([]);
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);
  const [loading, setLoading] = useState(false);
  const productsFetchLock = useRef(false);

  // Fetch products (paginated)
  const fetchProducts = async (url = null, append = false) => {
    if (productsFetchLock.current) return;
    productsFetchLock.current = true;
    setLoading(true);
    try {
      const pageSize = getPageSize();
      const apiUrl = url || `api/?page_size=${pageSize}`;
      let res = await api.get(apiUrl);
      setProducts((prev) => {
        if (append) {
          // Filter out duplicates by id
          const ids = new Set(prev.map((p) => p.id));
          const newProducts = res.data.results.filter((p) => !ids.has(p.id));
          return [...prev, ...newProducts];
        } else {
          return res.data.results;
        }
      });
      setNext(res.data.next);
      setPrev(res.data.previous);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    productsFetchLock.current = false;
  };

  // Initial load
  useEffect(() => {
    setProducts([]);
    setNext(null);
    setPrev(null);
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        next &&
        !loading &&
        !productsFetchLock.current
      ) {
        // Remove domain if present in next
        const nextUrl =
          next.startsWith(window.location.origin)
            ? next.replace(window.location.origin + "/", "")
            : next;
        fetchProducts(nextUrl, true); // append = true
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [next, loading]);

  useEffect(() => {
    // After products are loaded, check if more should be fetched
    if (
      products.length > 0 &&
      next && // there is a next page
      document.body.scrollHeight <= window.innerHeight // not scrollable yet
    ) {
      // Fetch next page
      const nextUrl =
        next.startsWith(window.location.origin)
          ? next.replace(window.location.origin + "/", "")
          : next;
      fetchProducts(nextUrl, true);
    }
    // eslint-disable-next-line
  }, [products, next]);

  return loading && products.length === 0 ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </div>
  ) : (
    <Navbar setLoading={setLoading} page='main' setProducts={setProducts}>
      <div className={styles["main"]}>
        <div className={styles["products-grid"]}>
          {products.map((product, i) => (
            <Product product={product} i={i} key={product.id || i} />
          ))}
        </div>
        {loading && (
          <div style={{ textAlign: "center", margin: 20 }}>
            <CircularProgress size={28} />
          </div>
        )}
      </div>
    </Navbar>
  );
}

export default Products;
