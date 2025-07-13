import React, {useState, useContext, useLayoutEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {CartContext} from '../contexts/CartContext';
import {useVoice} from '../contexts/VoiceContext';

const MenuDetailScreen = ({route, navigation}) => {
  const {item, fromCart, fromMenuList, fromVoice, existingOptions, existingQuantity, originalCartItem} = route.params || {};
  const {addToCart, updateCartItem} = useContext(CartContext);
  const {speak} = useVoice();

  // 기존 옵션이 있으면 사용, 없으면 기본값 설정
  const [quantity, setQuantity] = useState(existingQuantity || 1);
  const [selectedOptions, setSelectedOptions] = useState(() => {
    if (existingOptions) {
      return existingOptions;
    }
    
    const initialSize =
      item.options?.size && item.options.size.includes('medium')
        ? 'medium'
        : item.options?.size
        ? item.options.size[0]
        : null;
    const initialTemperature = item.options?.temperature
      ? item.options.temperature[0]
      : null;
    return {
      size: initialSize,
      temperature: initialTemperature,
      extras: [],
    };
  });

  // 헤더 설정 및 뒤로가기 처리
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={handleBackPress}
          style={{ marginLeft: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleBackPress]);

  // 음성 주문일 경우 안내 메시지 출력
  React.useEffect(() => {
    if (fromVoice) {
      speak(`${item.name} 옵션을 확인하세요. 원하시는 옵션을 선택하신 후 장바구니에 담아주세요.`);
    }
  }, [fromVoice, item.name, speak]);

  const handleBackPress = useCallback(() => {
    if (fromCart) {
      navigation.navigate('Cart');
    } else if (fromMenuList) {
      navigation.navigate('MenuList');
    } else {
      // fromVoice이거나 기타 경우 - Home으로
      navigation.navigate('Home');
    }
  }, [fromCart, fromMenuList, navigation]);

  const calculateAdjustedPrice = () => {
    let adjustedPrice = item.price;
    if (selectedOptions.size === 'small') {
      adjustedPrice -= 500;
    } else if (selectedOptions.size === 'large') {
      adjustedPrice += 500;
    }
    return adjustedPrice;
  };

  const handleAddToCart = () => {
    const adjustedPrice = calculateAdjustedPrice();
    const cartItem = {
      id: item.id,
      name: item.name,
      price: adjustedPrice,
      quantity: quantity,
      options: selectedOptions,
      totalPrice: adjustedPrice * quantity,
      category: item.category,
      description: item.description,
      image: item.image
    };

    if (fromCart && originalCartItem) {
      // Cart에서 온 경우 기존 아이템 수정
      updateCartItem(originalCartItem, cartItem);
      Alert.alert('수정 완료', `${item.name} 옵션이 수정되었습니다.`);
      navigation.navigate('Cart');
    } else {
      // 새로운 아이템 추가
      addToCart(cartItem);
      const message = `${item.name}이(가) 장바구니에 추가되었습니다.`;
      Alert.alert('장바구니', message);
      
      if (fromVoice) {
        speak(message + ' 추가 주문하시겠어요?');
      }
      
      // 경로에 따른 네비게이션
      if (fromMenuList) {
        navigation.navigate('MenuList');
      } else {
        navigation.navigate('Home');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{uri: item.image}} style={styles.image} />

      <View style={styles.content}>
        {fromVoice && (
          <View style={styles.voiceNotice}>
            <Icon name="mic" size={20} color="#007AFF" />
            <Text style={styles.voiceNoticeText}>
              음성으로 주문하신 메뉴입니다. 옵션을 확인해주세요.
            </Text>
          </View>
        )}
        
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>
          {calculateAdjustedPrice().toLocaleString()}원
        </Text>

        {/* 옵션 선택 */}
        {item.options?.size && (
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>사이즈</Text>
            <View style={styles.optionButtons}>
              {item.options.size.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    selectedOptions.size === size && styles.selectedOption,
                  ]}
                  onPress={() =>
                    setSelectedOptions({...selectedOptions, size})
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions.size === size && styles.selectedText,
                    ]}>
                    {size === 'small'
                      ? '작은'
                      : size === 'medium'
                      ? '보통'
                      : '큰'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {item.options?.temperature && (
          <View style={styles.optionSection}>
            <Text style={styles.optionTitle}>온도</Text>
            <View style={styles.optionButtons}>
              {item.options.temperature.map(temp => (
                <TouchableOpacity
                  key={temp}
                  style={[
                    styles.optionButton,
                    selectedOptions.temperature === temp &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    setSelectedOptions({...selectedOptions, temperature: temp})
                  }>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions.temperature === temp &&
                        styles.selectedText,
                    ]}>
                    {temp === 'hot' ? '따뜻한' : '차가운'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 수량 선택 */}
        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>수량</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 합계 */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>합계</Text>
          <Text style={styles.totalPrice}>
            {(calculateAdjustedPrice() * quantity).toLocaleString()}원
          </Text>
        </View>

        {/* 버튼 */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>
            {fromCart ? '옵션 수정 완료' : '장바구니에 담기'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  price: {
    fontSize: 24,
    color: '#007AFF',
    marginBottom: 30,
  },
  optionSection: {
    marginBottom: 25,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 25,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quantitySection: {
    marginBottom: 30,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: 'black',
  },
  quantity: {
    fontSize: 20,
    marginHorizontal: 30,
    minWidth: 40,
    textAlign: 'center',
    color: 'black',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  voiceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeft: 4,
    borderLeftColor: '#007AFF',
  },
  voiceNoticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default MenuDetailScreen;
