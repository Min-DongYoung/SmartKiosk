import React, { useContext } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CartContext } from '../contexts/CartContext';

// visible, onClose props 대신 navigation, route props를 받습니다.
const RecommendationModal = ({ navigation, route }) => {
  const { recommendations } = route.params; // route.params에서 데이터 추출
  const { addToCart } = useContext(CartContext);

  const handleSelectRecommendation = (item) => {
    addToCart({
      name: item.name,
      quantity: 1,
      size: 'medium',
      temperature: item.temperature || 'hot',
      options: [],
    });
    navigation.goBack(); // 모달 닫기
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectRecommendation(item)}>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemReason}>{item.reason}</Text>
      </View>
      <Icon name="add-shopping-cart" size={24} color="#4CAF50" />
    </TouchableOpacity>
  );

  return (
    // Modal 컴포넌트 대신 View를 사용하여 네비게이션 스택의 투명한 화면으로 작동합니다.
    <TouchableOpacity
        style={styles.centeredView}
        activeOpacity={1}
        onPressOut={() => navigation.goBack()} // 배경 클릭 시 닫기
    >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>이런 메뉴는 어떠세요?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendations}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
  },
  itemReason: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});

export default RecommendationModal;
