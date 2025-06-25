import React, { useEffect, useState, useRef } from "react";
import { checkIsAuthorized } from "../authrize";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import Error from "../components/erroAndMessage.jsx";

const CartContext = React.createContext({
  cartProducts: [],
  setCartProducts: () => {},
  handleCartChange: () => {},
  deleteFromCart: () => {},
  fetchNextPage: () => {},
  next: null,
  loading: false,
  error: '',
});

export const CartContextProvider = (props) => {
  const [error, setError] = useState('');
  const [cartProducts, setCartProducts] = useState([]);
  const [next, setNext] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchLock = useRef(false);

  // Fetch paginated cart items
  const fetchCartItems = async (url = null, append = false) => {
    if (fetchLock.current) return;
    fetchLock.current = true;
    setLoading(true);
    try {
      const pageSize = window.innerWidth < 600 ? 2 : 6;
      let apiUrl = url || `/api/mycart/?page_size=${pageSize}`;
      if (url) {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set("page_size", pageSize);
        apiUrl = urlObj.pathname + urlObj.search;
      }
      let res = await api.get(apiUrl);
      if (res.status === 200) {
        setCartProducts((prev) => {
          if (append) {
            const ids = new Set(prev.map((item) => item.id));
            const newItems = res.data.results.filter((item) => !ids.has(item.id));
            return [...prev, ...newItems];
          } else {
            return res.data.results;
          }
        });
        setNext(res.data.next);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error loading cart");
    }
    setLoading(false);
    fetchLock.current = false;
  };

  // Initial fetch
  useEffect(() => {
    setCartProducts([]);
    setNext(null);
    fetchCartItems();
    // eslint-disable-next-line
  }, []);

  // Auto-fetch next page if not scrollable and more items exist
  useEffect(() => {
    if (
      cartProducts.length > 0 &&
      next &&
      document.body.scrollHeight <= window.innerHeight &&
      !loading &&
      !fetchLock.current
    ) {
      const nextUrl =
        next.startsWith(window.location.origin)
          ? next.replace(window.location.origin + "/", "")
          : next;
      fetchCartItems(nextUrl, true);
    }
    // eslint-disable-next-line
  }, [cartProducts, next]);

  const navigate = useNavigate();
  function addToCart(product, itemQuantity) {
    console.log("addind...");
    setCartProducts((prevProducts) => {
      return [...prevProducts, { product: product, quantity: itemQuantity }];
    });
  }
  function updateQuantity(productId, itemQuantity) {
    // console.log(itemQuantity)
    setCartProducts((prevproducts) => {
      return prevproducts.map((cartProduct) => {
        if (cartProduct.product.id === productId) {
          return { ...cartProduct, quantity: itemQuantity };
        }
        return cartProduct;
      });
    });
  }
  async function deleteFromCart(productId) {
    let tempIsAuthorized = await checkIsAuthorized();
    if (!tempIsAuthorized) {
      navigate("/login");
      return;
    }
    try {
      let res = await api.delete("/api/mycart/", {
        data: {
          productId: productId,
        },
      });
      if (res.status == 202) {
        setCartProducts((prevProducts) => {
          return prevProducts.filter(
            (cartProduct) => cartProduct.product.id != productId
          );
        });
      } else if (res.status == 401) {
        navigate("/login");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(error);
    }
  }
  async function handleCartChange(product, itemQuantity) {
    let tempIsAuthorized = await checkIsAuthorized();
    if (!tempIsAuthorized) {
      navigate("/login");
      return;
    }
    try {
      let res = await api.post("/api/mycart/", {
        productId: product.id,
        quantity: itemQuantity,
      });

      if (res.status == 202) {
        // console.log(res.data.message);
        const existingProduct = cartProducts.find(
          (cartProduct) => cartProduct.product.id === product.id
        );
        if (existingProduct) {
          updateQuantity(product.id, itemQuantity);
        } else {
          addToCart(product, itemQuantity);
        }
      } else {
        console.log(res.data.message);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  }
  function check() {
    console.log("it works");
  }

  // Expose fetchNextPage to context
  const fetchNextPage = () => {
    if (next && !loading) {
      const nextUrl =
        next.startsWith(window.location.origin)
          ? next.replace(window.location.origin + "/", "")
          : next;
      fetchCartItems(nextUrl, true);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartProducts,
        setCartProducts,
        handleCartChange,
        deleteFromCart,
        fetchNextPage,
        next,
        loading,
        error,
      }}
    >
      {error && <Error message={error} />}
      {props.children}
    </CartContext.Provider>
  );
};

export default CartContext;
