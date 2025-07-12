import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MenuListScreen from '../screens/MenuListScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import CartScreen from '../screens/CartScreen';
import RecommendationModal from '../components/RecommendationModal'; // 추가

const RootStack = createStackNavigator();

const MainStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '홈' }} 
      />
      <Stack.Screen 
        name="MenuList" 
        component={MenuListScreen} 
        options={{ title: '메뉴' }} 
      />
      <Stack.Screen 
        name="MenuDetail" 
        component={MenuDetailScreen} 
        options={{ title: '메뉴 상세' }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: '장바구니' }} 
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ presentation: 'modal' }}>
      <RootStack.Screen
        name="Main"
        component={MainStack}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="RecommendationModal"
        component={RecommendationModal}
        options={{ 
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' },
            presentation: 'transparentModal',
        }}
      />
    </RootStack.Navigator>
  );
}
