

export const formatOrderData = (newOrders, currentData) => {
  const { currentAsks, currentBids } = { ...currentData };
  const newAsks = { ...currentAsks };
  const newBids = { ...currentBids };
  newOrders?.forEach((order) => {
    const [price, count, amount] = Array.isArray(order) ? order : [];
    if (!price || !count || !amount) return;
    if (amount > 0) {
      newBids[price] = Math.abs(amount);
    } else if (amount < 0) {
      newAsks[price] = Math.abs(amount);
    } else if (amount === 0) {
      delete newBids[price];
      delete newAsks[price];
    }
  });
  return ({ newAsks, newBids });
};

export const formatPrice = (amount) => {
  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};