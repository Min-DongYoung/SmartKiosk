import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../config';
import { useMenu } from '../contexts/MenuContext';
import { orderService } from '../services/orderService';
import { CartContext } from '../contexts/CartContext';

const QuickMenuItem = ({ item, navigation }) => {
  const [quantity, setQuantity] = useState(1);
  const { calculatePrice } = useMenu();
  const { clearCart, addToCart } = useContext(CartContext);

  const processPayment = async (currentQuantity) => {
    try {
      const itemPrice = calculatePrice(item, item.sizeOptions?.[0] || 'medium', item.extras || []);
      const orderData = {
        items: [{
          menuId: item.id,
          name: item.name,
          quantity: currentQuantity,
          options: {
            size: item.sizeOptions?.[0] || null,
            temperature: item.temperatureOptions?.[0] || null,
            extras: item.extras || [],
          },
          price: itemPrice,
        }],
        paymentMethod: 'card',
        isVoiceOrder: false,
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        Alert.alert('주문 완료', '주문이 접수되었습니다!');
        clearCart();
        // endSession(); // QuickMenuItem에서는 음성 세션 종료가 필요 없을 수 있음
        navigation.navigate('Home');
      } else {
        Alert.alert('결제 실패', response.error || '주문 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('바로 결제 오류:', error);
      Alert.alert('오류', '결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setQuantity(1); // 수량 초기화
    }
  };

  const confirmPayment = (currentQuantity) => {
    const itemPrice = calculatePrice(item, item.sizeOptions?.[0] || 'medium', item.extras || []);
    const totalItemPrice = itemPrice * currentQuantity;

    Alert.alert(
      '결제 확인',
      `총 ${totalItemPrice.toLocaleString()}원을 결제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제하기',
          onPress: () => processPayment(currentQuantity),
        },
      ]
    );
  };

  const handleQuickPay = () => {
    if (quantity <= 0) {
      Alert.alert('오류', '수량을 1개 이상으로 설정해주세요.');
      return;
    }

    const itemPrice = calculatePrice(item, item.sizeOptions?.[0] || 'medium', item.extras || []);
    const totalItemPrice = itemPrice * quantity;

    Alert.alert(
      '바로 결제',
      `${item.name} ${quantity}개가 선택되었습니다.`, 
      [
        {
          text: '결제하기',
          onPress: () => confirmPayment(quantity),
        },
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <TouchableOpacity 
      style={styles.quickMenuItem}
      onPress={() => navigation.navigate('MenuDetail', {item, fromMenuList: true})}
      activeOpacity={0.7}
    >
      <Image source={{uri: `${API_BASE_URL.replace('/api', '')}/uploads/${item.imageUrl}`}} style={styles.quickMenuImage} />
      <View style={styles.quickMenuInfo}>
        <Text style={styles.quickMenuName}>{item.name}</Text>
        <Text style={styles.quickMenuPrice}>{(calculatePrice(item, item.sizeOptions?.[0] || 'medium', item.extras || []) * quantity).toLocaleString()}원</Text>
        
        <View style={styles.quickMenuControls}>
          <TouchableOpacity
            style={styles.quickQuantityButton}
            onPress={(e) => {
              e.stopPropagation();
              setQuantity(Math.max(1, quantity - 1));
            }}>
            <Text style={styles.quickQuantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quickQuantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quickQuantityButton}
            onPress={(e) => {
              e.stopPropagation();
              setQuantity(quantity + 1);
            }}>
            <Text style={styles.quickQuantityButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPayButton}
            onPress={(e) => {
              e.stopPropagation();
              handleQuickPay();
            }}>
            <Text style={styles.quickPayButtonText}>바로 결제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quickMenuItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickMenuImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'contain',
  },
  quickMenuInfo: {
    flex: 1,
  },
  quickMenuName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  quickMenuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  quickMenuControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  quickQuantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#e8e8e8',
  },
  quickQuantityButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  quickQuantityText: {
    fontSize: 15,
    color: '#333',
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  quickPayButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  quickPayButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default QuickMenuItem;