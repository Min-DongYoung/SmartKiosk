import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useMenu } from '../contexts/MenuContext';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

const LoadingScreen = () => {
  const { loading: menuLoading } = useMenu();
  const { isProcessingOrder } = useContext(CartContext);
  
  if (!menuLoading && !isProcessingOrder) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default LoadingScreen;