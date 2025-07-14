import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {CartContext} from '../contexts/CartContext';
import {useVoice} from '../contexts/VoiceContext';
import {useMenu} from '../contexts/MenuContext';
import { API_BASE_URL } from '../config';

const MenuDetailScreen = ({route, navigation}) => {
  const {item: initialItem, fromVoice, existingOptions, existingQuantity, fromCart, originalCartItem} = route.params;
  const {addToCart, updateCartItem} = useContext(CartContext);
  const {speak, sessionActive, startListening, endSession} = useVoice();
  const {findMenuItem, calculatePrice} = useMenu();

  const [item, setItem] = useState(initialItem);
  const [selectedSize, setSelectedSize] = useState(existingOptions?.size || (item.sizeOptions?.includes('medium') ? 'medium' : item.sizeOptions?.[0]) || 'medium');
  const [selectedTemperature, setSelectedTemperature] = useState(existingOptions?.temperature || item.temperatureOptions?.[0] || 'hot');
  const [selectedExtras, setSelectedExtras] = useState(existingOptions?.extras || []);
  const [quantity, setQuantity] = useState(existingQuantity || 1);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    // 서버에서 최신 메뉴 정보 가져오기 (혹시 모를 업데이트 대비)
    const latestMenuItem = findMenuItem(initialItem.name);
    if (latestMenuItem) {
      setItem(latestMenuItem);
      // 초기 옵션 설정 (기존 장바구니 항목 수정 시)
      if (fromCart && originalCartItem) {
        setSelectedSize(originalCartItem.options.size || latestMenuItem.sizeOptions?.[0] || 'medium');
        setSelectedTemperature(originalCartItem.options.temperature || latestMenuItem.temperatureOptions?.[0] || 'hot');
        setSelectedExtras(originalCartItem.options.extras || []);
        setQuantity(originalCartItem.quantity);
      } else if (fromVoice) {
        setSelectedSize(existingOptions?.size || latestMenuItem.sizeOptions?.[0] || 'medium');
        setSelectedTemperature(existingOptions?.temperature || latestMenuItem.temperatureOptions?.[0] || 'hot');
        setQuantity(existingQuantity || 1);
      }
    }
  }, [initialItem, fromCart, originalCartItem, fromVoice, existingOptions, existingQuantity, findMenuItem]);

  useEffect(() => {
    if (item) {
      const price = calculatePrice(item, selectedSize, selectedExtras);
      setCurrentPrice(price);
    }
  }, [item, selectedSize, selectedExtras, calculatePrice]);

  useEffect(() => {
    if (fromVoice && sessionActive) {
      speak(`${item.name} ${quantity}개를 선택하셨습니다. 사이즈는 ${selectedSize}, 온도는 ${selectedTemperature}입니다. 추가 옵션이 필요하시면 말씀해주세요.`);
      startListening();
    }
  }, [fromVoice, sessionActive, item, quantity, selectedSize, selectedTemperature, speak, startListening]);

  const handleAddToCart = () => {
    if (!item) return;

    const itemToAdd = {
      id: item._id, // MongoDB _id 사용
      name: item.name,
      price: currentPrice,
      quantity: quantity,
      options: {
        size: selectedSize,
        temperature: selectedTemperature,
        extras: selectedExtras,
      },
      totalPrice: currentPrice * quantity,
      category: item.category,
      description: item.description,
      imageUrl: item.imageUrl, // imageUrl 사용
    };

    if (fromCart && originalCartItem) {
      updateCartItem(originalCartItem, itemToAdd);
      Alert.alert('장바구니 수정', `${item.name}이(가) 장바구니에서 수정되었습니다.`);
    } else {
      addToCart(itemToAdd);
      Alert.alert('장바구니 추가', `${item.name} ${quantity}개가 장바구니에 담겼습니다.`);
    }

    if (sessionActive) {
      endSession();
    }
    navigation.navigate('MenuList');
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>메뉴 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{uri: `${API_BASE_URL.replace('/api', '')}/uploads/${item.imageUrl}`}} style={styles.menuImage} />
        <View style={styles.detailsContainer}>
          <Text style={styles.menuName}>{item.name}</Text>
          <Text style={styles.menuDescription}>{item.description}</Text>
          <Text style={styles.menuPrice}>{currentPrice.toLocaleString()}원</Text>

          {/* 사이즈 옵션 */}
          {item.sizeOptions && item.sizeOptions.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>사이즈</Text>
              <View style={styles.optionsContainer}>
                {item.sizeOptions.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      selectedSize === size && styles.selectedOptionButton,
                    ]}
                    onPress={() => setSelectedSize(size)}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedSize === size && styles.selectedOptionButtonText,
                      ]}>
                      {size.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 온도 옵션 */}
          {item.temperatureOptions && item.temperatureOptions.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>온도</Text>
              <View style={styles.optionsContainer}>
                {item.temperatureOptions.map(temp => (
                  <TouchableOpacity
                    key={temp}
                    style={[
                      styles.optionButton,
                      selectedTemperature === temp &&
                        styles.selectedOptionButton,
                    ]}
                    onPress={() => setSelectedTemperature(temp)}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedTemperature === temp &&
                          styles.selectedOptionButtonText,
                      ]}>
                      {temp.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 추가 옵션 (extras) */}
          {item.extras && item.extras.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionTitle}>추가 옵션</Text>
              <View style={styles.optionsContainer}>
                {item.extras.map(extra => (
                  <TouchableOpacity
                    key={extra.name}
                    style={[
                      styles.optionButton,
                      selectedExtras.includes(extra.name) &&
                        styles.selectedOptionButton,
                    ]}
                    onPress={() => {
                      setSelectedExtras(prev =>
                        prev.includes(extra.name)
                          ? prev.filter(e => e !== extra.name)
                          : [...prev, extra.name],
                      );
                    }}>
                    <Text
                      style={[
                        styles.optionButtonText,
                        selectedExtras.includes(extra.name) &&
                          styles.selectedOptionButtonText,
                      ]}>
                      {extra.name} (+{extra.price.toLocaleString()}원)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 수량 조절 */}
          <View style={styles.quantitySection}>
            <Text style={styles.optionTitle}>수량</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.addToCartButtonContainer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>
            {fromCart ? '장바구니 수정' : '장바구니에 담기'} - 총{' '}
            {(currentPrice * quantity).toLocaleString()}원
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 100, // 장바구니 버튼 공간 확보
  },
  menuImage: {
    width: '100%',
    height: 280, // 이미지 높이 증가
    resizeMode: 'contain',
    borderBottomLeftRadius: 20, // 하단 모서리 둥글게
    borderBottomRightRadius: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  menuName: {
    fontSize: 32, // 폰트 크기 증가
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  menuDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  menuPrice: {
    fontSize: 28, // 폰트 크기 증가
    fontWeight: 'bold',
    color: '#4CAF50', // 가격 색상 변경
    marginBottom: 25,
  },
  optionSection: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
  },
  selectedOptionButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionButtonText: {
    color: 'white',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#333',
  },
  addToCartButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  addToCartButton: {
    backgroundColor: '#FFC107', // Amber color for button
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addToCartButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'red',
  },
});

export default MenuDetailScreen;