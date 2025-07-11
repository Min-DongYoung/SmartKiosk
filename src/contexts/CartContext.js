import React, {createContext, useState} from 'react';

export const CartContext = createContext();

export const CartProvider = ({children}) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = item => {
    setCartItems(prevItems => {
      // 이미 장바구니에 있는 상품인지 확인 (동일한 ID와 옵션)
      const existingItemIndex = prevItems.findIndex(
        cartItem =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.options) === JSON.stringify(item.options),
      );

      if (existingItemIndex > -1) {
        // 이미 있는 상품이면 수량만 증가
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          totalPrice:
            updatedItems[existingItemIndex].totalPrice + item.totalPrice,
        };
        return updatedItems;
      } else {
        // 새로운 상품이면 추가
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (id, options) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item =>
          !(
            item.id === id &&
            JSON.stringify(item.options) === JSON.stringify(options)
          ),
      ),
    );
  };

  const updateQuantity = (id, options, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id &&
        JSON.stringify(item.options) === JSON.stringify(options)
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: (item.price || 0) * newQuantity,
            }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
};
