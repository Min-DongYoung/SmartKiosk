import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import MenuListScreen from '../screens/MenuListScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
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
