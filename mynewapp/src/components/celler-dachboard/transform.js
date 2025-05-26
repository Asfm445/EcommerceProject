export function transform(orderItems) {
  // Transform the data
  const ordersMap = {};

  orderItems.forEach((item) => {
    const orderId = item.order.id;

    if (!ordersMap[orderId]) {
      ordersMap[orderId] = {
        id: orderId,
        created_at: item.order.created_at,
        username: item.order.username, // Include the username
        items: [],
      };
    }

    // Add the item to the order's items array (excluding the nested order)
    const { order, ...itemWithoutOrder } = item;
    ordersMap[orderId].items.push(itemWithoutOrder);
  });

  // Convert the map to an array of orders
  const orders = Object.values(ordersMap);

  return orders;
}
