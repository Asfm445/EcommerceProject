import { cartProducts } from "../../data/cart-quantity.js";
import deliveryOption from "../../data/deliveryOption.js";
import products from "../../data/products.js";
import { formatCurrency } from "../utilitis/money.js";

function find(id,arr){
    let newval=arr.filter((val)=>{
        return val.id===id
    })
    return newval;
}
export function paymentSummery(){
    let totalItemsPrice=0;
let shippingPrice=0;
cartProducts.forEach((item)=>{
    products.forEach((i)=>{
        if(item.id===i.id){
            totalItemsPrice+=(item.Quantity*i.priceCents)
        }
    })
    let del=find(item.deliveryOptionId,deliveryOption);
    shippingPrice+=del[0].priceCents
    
})
let total=totalItemsPrice+shippingPrice;
let tax=total*0.1;
let content = `
    <div class="payment-summary-title">
    Order Summary
    </div>

    <div class="payment-summary-row">
    <div>Items (${cartProducts.length}):</div>
    <div class="payment-summary-money">$${formatCurrency(totalItemsPrice)}</div>
    </div>

    <div class="payment-summary-row">
    <div>Shipping &amp; handling:</div>
    <div class="payment-summary-money">$${formatCurrency(shippingPrice)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
    <div>Total before tax:</div>
    <div class="payment-summary-money">$${formatCurrency(total)}</div>
    </div>

    <div class="payment-summary-row">
    <div>Estimated tax (10%):</div>
    <div class="payment-summary-money">$${formatCurrency((tax))}</div>
    </div>

    <div class="payment-summary-row total-row">
    <div>Order total:</div>
    <div class="payment-summary-money">$${formatCurrency(total+tax)}</div>
    </div>

    <button class="place-order-button button-primary">
    Place your order
    </button>
`;
document.querySelector(".payment-summary").innerHTML=content;
}