import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {CartContext} from '../contexts/CartContext';
import {useVoice} from '../contexts/VoiceContext';
import { API_BASE_URL } from '../config';
import { useMenu } from '../contexts/MenuContext';

const CartScreen = ({navigation}) => {
  const {cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice} = useContext(CartContext);
  const {endSession} = useVoice();
  const { findMenuItem } = useMenu();

  const removeItem = itemToRemove => {
    Alert.alert('삭제 확인', '이 항목을 장바구니에서 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        onPress: () => {
          removeFromCart(itemToRemove.id, itemToRemove.options);
        },
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('알림', '장바구니가 비어있습니다.');
      return;
    }

    Alert.alert(
      '주문 확인',
      `총 ${getTotalPrice().toLocaleString()}원을 결제하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {text: '결제하기', onPress: () => {
            // 결제 로직
            Alert.alert('주문 완료', '주문이 접수되었습니다!');
            clearCart(); // 장바구니 비우기
            endSession(); // 음성 세션 종료
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  const handleItemPress = (item) => {
    const menuItem = findMenuItem(item.name);
    if (!menuItem) {
      Alert.alert('오류', '메뉴 정보를 찾을 수 없습니다.');
      return;
    }

    navigation.navigate('MenuDetail', {
      item: menuItem,
      fromCart: true,
      originalCartItem: item,
      existingOptions: item.options,
      existingQuantity: item.quantity
    });
  };

  const renderCartItem = ({item}) => (
    <TouchableOpacity 
      style={styles.cartItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{uri: `${API_BASE_URL.replace('/api', '')}/uploads/${item.imageUrl}`}} style={styles.cartItemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemOptions}>
          {item.category !== '디저트' && item.options.size && `사이즈: ${item.options.size === 'small' ? '작은' : item.options.size === 'medium' ? '보통' : '큰'}`}
          {item.category !== '디저트' && item.options.temperature && `, ${item.options.temperature === 'hot' ? '따뜻한' : '차가운'}`}
          {item.options.extras && item.options.extras.length > 0 && 
            `, 옵션: ${item.options.extras.join(', ')}`}
        </Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={(e) => {
              e.stopPropagation();
              updateQuantity(
                item.id,
                item.options,
                Math.max(1, item.quantity - 1),
              );
            }}>
            <Icon name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}개</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={(e) => {
              e.stopPropagation();
              updateQuantity(item.id, item.options, item.quantity + 1);
            }}>
            <Icon name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemPriceSection}>
        <Text style={styles.itemPrice}>
          {(item.price * item.quantity).toLocaleString()}원
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            removeItem(item);
          }}>
          <Icon name="delete" size={28} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity >
  );

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={80} color="#ccc" style={styles.emptyCartIcon} />
          <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('MenuList')}>
            <Text style={styles.continueButtonText}>메뉴 보러가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => `${item.id}-${JSON.stringify(item.options)}`}
            contentContainerStyle={styles.cartList}
          />

          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>총 결제 금액</Text>
              <Text style={styles.totalPrice}>
                {getTotalPrice().toLocaleString()}원
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}>
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
  cartList: {
    padding: 15,
  },
  cartItem: {
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
  cartItemImage: {
    width: 75,
    height: 75,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'contain',
  },
  itemInfo: {
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  itemOptions: {
    fontSize: 13,
    color: '#777',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignSelf: 'flex-start'
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#e8e8e8',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 15,
    color: '#333',
    marginHorizontal: 5, // 변경: 마진 조정
    fontWeight: 'bold',
    minWidth: 35, // 추가: 최소 너비 설정
    textAlign: 'center', // 추가: 텍스트 중앙 정렬
  },
  itemPriceSection: {
    alignItems: 'flex-end',
    minWidth: 120, // 가격 텍스트가 길어져도 공간을 확보하기 위한 최소 너비
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  removeButton: {
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyCartIcon: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  checkoutButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CartScreen;
