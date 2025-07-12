import React, { createContext, useState, useCallback } from 'react';
import { menuItems, calculatePrice, findMenuItem } from '../data/menuData';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((itemFromVoice) => {
    const menuItem = findMenuItem(itemFromVoice.name);
    if (!menuItem) {
      console.warn(`메뉴를 찾을 수 없음: ${itemFromVoice.name}`);
      return;
    }

    const price = calculatePrice(menuItem, itemFromVoice.size, itemFromVoice.options);
    const newItem = {
      id: menuItem.id,
      name: menuItem.name,
      price: price,
      quantity: itemFromVoice.quantity || 1,
      options: {
        size: itemFromVoice.size || 'medium',
        temperature: itemFromVoice.temperature,
        extras: itemFromVoice.options || [],
      },
      totalPrice: price * (itemFromVoice.quantity || 1),
    };

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem =>
          cartItem.id === newItem.id &&
          JSON.stringify(cartItem.options) === JSON.stringify(newItem.options),
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        existingItem.quantity += newItem.quantity;
        existingItem.totalPrice += newItem.totalPrice;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setCartItems(prevItems => {
        const itemIndexToRemove = prevItems.findIndex(item => item.id === itemId);
        if (itemIndexToRemove > -1) {
            const newItems = [...prevItems];
            newItems.splice(itemIndexToRemove, 1);
            return newItems;
        }
        return prevItems;
    });
  }, []);

  const removeFromCart = useCallback((id, options) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item =>
          !(
            item.id === id &&
            JSON.stringify(item.options) === JSON.stringify(options)
          ),
      ),
    );
  }, []);

  const updateQuantity = useCallback((id, options, newQuantity) => {
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
      ).filter(item => item.quantity > 0) // 수량이 0이 되면 제거
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeItem, // VoiceContext용
        removeFromCart, // UI용
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
};
