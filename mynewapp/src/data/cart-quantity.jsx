import React, { useEffect, useState } from "react";
import { checkIsAuthorized } from "../authrize";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import Error from "../components/erroAndMessage.jsx";
// import { find } from "../scripts/utilitis/filter.js";

const CartContext = React.createContext({
  cartProducts: [],
  setCartProducts: () => {},
  handleCartChange: () => {},
  deleteFromCart: () => {},
  error:'',
});

export const CartContextProvider = (props) => {
  const [error,setError]=useState('')
  const [cartProducts, setCartProducts] = useState([]);
  useEffect(() => {
    async function getCartData() {
      let tempIsAuthorized = await checkIsAuthorized();
      if (!tempIsAuthorized) {
        return;
      }
      try {
        let res = await api.get("/api/mycart/");
        if (res.status == 200) {
          setCartProducts(res.data.items);
        } else if (res.status == 404) {
          setCartProducts([]);
        }else if(res.status==400){
          setError(res.data.message)
        }
      } catch (error) {
        console.log(error.data.message)
      }
    }
    getCartData();
  }, []);

  const navigate = useNavigate();
  function addToCart(product, itemQuantity) {
    console.log("addind...");
    setCartProducts((prevProducts) => {
      return [...prevProducts, { product: product, quantity: itemQuantity }];
    });
  }
  function updateQuantity(productId, itemQuantity) {
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

  return (
    <CartContext.Provider
      value={{
        cartProducts: cartProducts,
        setCartProducts: setCartProducts,
        handleCartChange: handleCartChange,
        deleteFromCart: deleteFromCart,
        check: check,
        error:error,
      }}
    >
      {error && <Error message={error} />}
      {props.children}
    </CartContext.Provider>
  );
};

export default CartContext;
