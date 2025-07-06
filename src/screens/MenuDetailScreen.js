import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const MenuDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
    size: 'medium',
    temperature: 'hot',
  });

  const handleAddToCart = () => {
    // 장바구니에 추가하는 로직
    const cartItem = {
      ...item,
      quantity,
      options: selectedOptions,
      totalPrice: item.price * quantity,
    };
    
    console.log('장바구니에 추가:', cartItem);
    navigation.navigate('Cart', { newItem: cartItem });
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
        
        {/* 옵션 선택 */}
        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>사이즈</Text>
          <View style={styles.optionButtons}>
            {['small', 'medium', 'large'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedOptions.size === size && styles.selectedOption,
                ]}
                onPress={() => setSelectedOptions({ ...selectedOptions, size })}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOptions.size === size && styles.selectedText,
                  ]}
                >
                  {size === 'small' ? '작은' : size === 'medium' ? '보통' : '큰'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.optionSection}>
          <Text style={styles.optionTitle}>온도</Text>
          <View style={styles.optionButtons}>
            {['hot', 'ice'].map((temp) => (
              <TouchableOpacity
                key={temp}
                style={[
                  styles.optionButton,
                  selectedOptions.temperature === temp && styles.selectedOption,
                ]}
                onPress={() => setSelectedOptions({ ...selectedOptions, temperature: temp })}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedOptions.temperature === temp && styles.selectedText,
                  ]}
                >
                  {temp === 'hot' ? '따뜻한' : '차가운'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 수량 선택 */}
        <View style={styles.quantitySection}>
          <Text style={styles.optionTitle}>수량</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 합계 */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>합계</Text>
          <Text style={styles.totalPrice}>
            {(item.price * quantity).toLocaleString()}원
          </Text>
        </View>

        {/* 버튼 */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>장바구니에 담기</Text>
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
    fontSize: 24,
    color: '#333',
  },
  quantity: {
    fontSize: 20,
    marginHorizontal: 30,
    minWidth: 40,
    textAlign: 'center',
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
});

export default MenuDetailScreen;