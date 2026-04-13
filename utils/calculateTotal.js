export const calculateTotal = (items) => {
	return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
};
