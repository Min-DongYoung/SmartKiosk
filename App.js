import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/contexts/CartContext';
import { VoiceProvider } from './src/contexts/VoiceContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalVoiceButton from './src/components/GlobalVoiceButton';
import { navigationRef } from './src/navigation/navigationService';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer ref={navigationRef}>
          <VoiceProvider>
            <AppNavigator />
            <GlobalVoiceButton />
          </VoiceProvider>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}