import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

const CartScreen = ({ navigation }) => {
  // 샘플 장바구니 데이터
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: '아메리카노',
      price: 4500,
      quantity: 2,
      options: { size: 'large', temperature: 'ice' },
      totalPrice: 9000,
    },
    {
      id: '2',
      name: '크로와상',
      price: 3500,
      quantity: 1,
      options: {},
      totalPrice: 3500,
    },
  ]);

  const removeItem = (id) => {
    Alert.alert(
      '삭제 확인',
      '이 항목을 장바구니에서 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: () => {
            setCartItems(cartItems.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCheckout = () => {
    Alert.alert(
      '주문 확인',
      `총 ${getTotalPrice().toLocaleString()}원을 결제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제하기',
          onPress: () => {
            // 결제 로직
            Alert.alert('주문 완료', '주문이 접수되었습니다!');
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOptions}>
          {item.options.size && `사이즈: ${item.options.size}`}
          {item.options.temperature && `, ${item.options.temperature}`}
        </Text>
        <Text style={styles.itemQuantity}>수량: {item.quantity}개</Text>
      </View>
      <View style={styles.itemPriceSection}>
        <Text style={styles.itemPrice}>{item.totalPrice.toLocaleString()}원</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.removeButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>장바구니</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>장바구니가 비어있습니다</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MenuList')}
          >
            <Text style={styles.continueButtonText}>메뉴 보러가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
          />

          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>총 금액</Text>
              <Text style={styles.totalPrice}>
                {getTotalPrice().toLocaleString()}원
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>결제하기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemOptions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPriceSection: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  removeButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 15,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    elevation: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CartScreen;