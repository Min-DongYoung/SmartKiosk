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
import QuickMenuItem from '../components/QuickMenuItem';

const categories = [
  'quick',
  'all',
  '커피',
  '라떼',
  '에이드',
  '스무디',
  '티',
  '디저트',
];

import { API_BASE_URL } from '../config';

const MenuListScreen = ({navigation}) => {
  const { menus, loading, error, quickMenus } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState('quick');

  const renderMenuItem = ({item}) => {
    if (selectedCategory === 'quick') {
      return <QuickMenuItem item={item} navigation={navigation} />;
    } else {
      return (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MenuDetail', {item, fromMenuList: true})}>
          <Image source={{uri: `${API_BASE_URL.replace('/api', '')}/uploads/${item.imageUrl}`}} style={styles.menuImage} />
          <View style={styles.menuInfo}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuCategory}>{item.category}</Text>
            <Text style={styles.menuPrice}>{item.price.toLocaleString()}원</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const filteredMenuItems =
    selectedCategory === 'all'
      ? Object.values(menus)
      : selectedCategory === 'quick'
      ? quickMenus
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
        key={selectedCategory} // Add key prop to force re-render on category change
        numColumns={selectedCategory === 'quick' ? 1 : 2} // Quick 카테고리일 때 1열
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
    backgroundColor: '#4CAF50', // Green color for selected category
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
    width: '48%', // 2열을 위해 너비 조정
    backgroundColor: 'white',
    margin: '1%', // 좌우 마진 조정
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  menuImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
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
    color: '#4CAF50', // Green color for price
  },
  // Quick 메뉴 스타일
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

export default MenuListScreen;