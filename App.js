import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './src/context/CartContext';
import { VoiceProvider } from './src/contexts/VoiceContext';
import AppNavigator from './src/navigation/AppNavigator';
import GlobalVoiceButton from './src/components/GlobalVoiceButton';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <VoiceProvider>
            <AppNavigator />
            <GlobalVoiceButton />
          </VoiceProvider>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
