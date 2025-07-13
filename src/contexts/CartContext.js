import React, { createContext, useState, useCallback } from 'react';
import { menuItems, calculatePrice, findMenuItem } from '../data/menuData';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((item) => {
    // MenuDetailScreen에서 오는 경우와 음성에서 오는 경우를 구분
    let newItem;
    
    if (item.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
      // MenuDetailScreen에서 온 경우 (options가 객체)
      newItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
        totalPrice: item.totalPrice,
        category: item.category,
        description: item.description,
        image: item.image
      };
    } else {
      // 음성에서 온 경우 (기존 로직)
      const menuItem = findMenuItem(item.name);
      if (!menuItem) {
        console.warn(`메뉴를 찾을 수 없음: ${item.name}`);
        return;
      }

      const price = calculatePrice(menuItem, item.size, item.options);
      newItem = {
        id: menuItem.id,
        name: menuItem.name,
        price: price,
        quantity: item.quantity || 1,
        options: {
          size: item.size || 'medium',
          temperature: item.temperature,
          extras: item.options || [],
        },
        totalPrice: price * (item.quantity || 1),
      };
    }

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

  const updateCartItem = useCallback((originalItem, updatedItem) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        // 원래 아이템과 id + options가 일치하는 경우 업데이트
        if (item.id === originalItem.id && 
            JSON.stringify(item.options) === JSON.stringify(originalItem.options)) {
          return { ...updatedItem };
        }
        return item;
      })
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
        updateCartItem,
        clearCart,
        getTotalPrice,
      }}>
      {children}
    </CartContext.Provider>
  );
};
