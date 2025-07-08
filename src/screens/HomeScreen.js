import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const HomeScreen = ({navigation}) => {
  // navigation prop 추가
  return (
    <View style={styles.container}>
      <Text style={styles.title}>스마트 키오스크</Text>
      <Text style={styles.subtitle}>음성과 터치로 주문하세요</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MenuList')} // 네비게이션 추가
      >
        <Text style={styles.buttonText}>주문 시작</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
