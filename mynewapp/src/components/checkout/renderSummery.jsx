import React, { useContext } from "react";
import AuthContext from "../../data/cart-quantity";
import RenderSummeryItem from "./renderSummeryItem.jsx";
function RenderSummery() {
  const ctx=useContext(AuthContext)
  return ctx.cartProducts.map((v, i) => (
    <RenderSummeryItem v={v} key={i}></RenderSummeryItem>
  ));
}

export default RenderSummery;
