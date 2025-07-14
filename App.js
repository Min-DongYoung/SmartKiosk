import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenuProvider } from './src/contexts/MenuContext';
import { CartProvider } from './src/contexts/CartContext';
import { VoiceProvider } from './src/contexts/VoiceContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationService';
import LoadingScreen from './src/components/LoadingScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <MenuProvider>
        <CartProvider>
          <NavigationContainer ref={navigationRef}>
            <VoiceProvider>
              <AppNavigator />
              <LoadingScreen />
            </VoiceProvider>
          </NavigationContainer>
        </CartProvider>
      </MenuProvider>
    </SafeAreaProvider>
  );
}