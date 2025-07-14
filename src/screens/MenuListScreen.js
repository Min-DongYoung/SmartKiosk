import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

import { useMenu } from '../contexts/MenuContext';

const categories = [
  'all',
  '커피',
  '라떼',
  '에이드',
  '스무디',
  '티',
  '디저트',
];

const MenuListScreen = ({navigation}) => {
  const { menus, loading, error } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const renderMenuItem = ({item}) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate('MenuDetail', {item, fromMenuList: true})}>
      <Image source={{uri: item.imageUrl}} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuCategory}>{item.category}</Text>
        <Text style={styles.menuPrice}>{item.price.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredMenuItems =
    selectedCategory === 'all'
      ? Object.values(menus)
      : Object.values(menus).filter(
          item => item.category === selectedCategory,
        );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>메뉴 로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>오류: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}>
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category &&
                    styles.selectedCategoryButtonText,
                ]}>
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMenuItems}
        renderItem={renderMenuItem}
        keyExtractor={item => item.id}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 80, // cartButton과 같은 너비로 균형 맞춤
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
  categoryContainer: {
    paddingVertical: 10,
    backgroundColor: 'white',
    elevation: 1,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  selectedCategoryButtonText: {
    color: 'white',
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
    color: 'black',
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