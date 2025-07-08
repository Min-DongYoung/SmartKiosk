import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// 화면 import
import HomeScreen from '../screens/HomeScreen';
import MenuListScreen from '../screens/MenuListScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '스마트 키오스크',
            headerShown: false, // 홈 화면은 헤더 숨김
          }}
        />

        <Stack.Screen
          name="MenuList"
          component={MenuListScreen}
          options={{
            title: '메뉴 선택',
          }}
        />

        <Stack.Screen
          name="MenuDetail"
          component={MenuDetailScreen}
          options={({route}) => ({
            title: route.params?.item?.name || '메뉴 상세',
          })}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: '장바구니',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
