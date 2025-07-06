import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

const MenuListScreen = ({ navigation }) => {
  // 샘플 메뉴 데이터
  const menuData = [
    {
      id: '1',
      name: '아메리카노',
      price: 4500,
      category: '커피',
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '2',
      name: '카페라떼',
      price: 5000,
      category: '커피',
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '3',
      name: '초코라떼',
      price: 5500,
      category: '음료',
      image: 'https://via.placeholder.com/100',
    },
    {
      id: '4',
      name: '크로와상',
      price: 3500,
      category: '베이커리',
      image: 'https://via.placeholder.com/100',
    },
  ];

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate('MenuDetail', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuCategory}>{item.category}</Text>
        <Text style={styles.menuPrice}>{item.price.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>메뉴 선택</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>장바구니</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={menuData}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.menuList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuList: {
    padding: 10,
  },
  menuItem: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  menuImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  menuCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default MenuListScreen;