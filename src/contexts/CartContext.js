import React, { createContext, useState, useCallback, useContext } from 'react';
import { useMenu } from './MenuContext';
import { orderService } from '../services/orderService';
import { Alert } from 'react-native';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState(null);
  
  const { findMenuItem, calculatePrice } = useMenu();

  const addToCart = useCallback((item) => {
    let newItem;
    
    if (item.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
      // MenuDetailScreen에서 온 경우
      newItem = {
        id: item.id, // _id 대신 id 사용 (기존 호환성)
        menuId: item.id, // 서버 전송용
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: item.options,
        totalPrice: item.totalPrice,
        category: item.category,
        description: item.description,
        imageUrl: item.imageUrl, // imageUrl 사용
      };
    } else {
      // 음성에서 온 경우
      const menuItem = findMenuItem(item.name);
      if (!menuItem) {
        console.warn(`메뉴를 찾을 수 없음: ${item.name}`);
        return;
      }

      const price = calculatePrice(menuItem, item.size, item.options);
      newItem = {
        id: menuItem.id, // _id 대신 id 사용 (기존 호환성)
        menuId: menuItem.id,
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
  }, [findMenuItem, calculatePrice]);

  // 주문 생성 (서버 연동)
  const createOrder = useCallback(async (paymentMethod = 'card', customerInfo = {}, isVoiceOrder = false, voiceSessionId = null) => {
    if (cartItems.length === 0) {
      throw new Error('장바구니가 비어있습니다');
    }

    setIsProcessingOrder(true);
    
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuId: item.menuId || item.id,
          name: item.name,
          quantity: item.quantity,
          options: item.options,
          price: item.price
        })),
        paymentMethod,
        customerInfo,
        isVoiceOrder,
        voiceSessionId
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        setLastOrderNumber(response.data.orderNumber);
        clearCart();
        return response.data;
      } else {
        throw new Error(response.error || '주문 처리 실패');
      }
    } catch (error) {
      console.error('주문 생성 오류:', error);
      Alert.alert(
        '주문 실패',
        error.error || '다시 시도해주세요.'
      );
      throw error;
    } finally {
      setIsProcessingOrder(false);
    }
  }, [cartItems]);

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
      ).filter(item => item.quantity > 0)
    );
  }, []);

  const updateCartItem = useCallback((originalItem, updatedItem) => {
    setCartItems(prevItems => {
      const sortedOriginalItemOptions = {
        ...originalItem.options,
        extras: originalItem.options.extras ? [...originalItem.options.extras].sort() : [],
      };
      return prevItems.map(item => {
        const sortedCartItemOptions = {
          ...item.options,
          extras: item.options.extras ? [...item.options.extras].sort() : [],
        };
        if (item.id === originalItem.id && 
            JSON.stringify(sortedCartItemOptions) === JSON.stringify(sortedOriginalItemOptions)) {
          return { ...updatedItem };
        }
        return item;
      });
    });
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
        isProcessingOrder,
        lastOrderNumber,
        addToCart,
        removeItem,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
        getTotalPrice,
        createOrder,
      }}>
      {children}
    </CartContext.Provider>
  );
};