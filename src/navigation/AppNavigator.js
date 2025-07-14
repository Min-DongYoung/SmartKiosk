import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import MenuListScreen from '../screens/MenuListScreen';
import MenuDetailScreen from '../screens/MenuDetailScreen';
import CartScreen from '../screens/CartScreen';
import GlobalVoiceButton from '../components/GlobalVoiceButton';
import RecommendationModal from '../components/RecommendationModal';

const RootStack = createStackNavigator();

const CartButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.cartButton}
      onPress={() => navigation.navigate('Cart')}>
      <Text style={styles.cartButtonText}>장바구니</Text>
    </TouchableOpacity>
  );
};

const MainStack = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
          elevation: 2,
        },
        headerTitle: () => <GlobalVoiceButton />,
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{title: ''}} />
      <Stack.Screen
        name="MenuList"
        component={MenuListScreen}
        options={{
          title: '',
          headerRight: () => <CartButton />,
        }}
      />
      <Stack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={{title: ''}}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{title: ''}} />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{presentation: 'modal'}}>
      <RootStack.Screen
        name="Main"
        component={MainStack}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="RecommendationModal"
        component={RecommendationModal}
        options={{
          headerShown: false,
          cardStyle: {backgroundColor: 'transparent'},
          presentation: 'transparentModal',
        }}
      />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  cartButton: {
    marginRight: 5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 10, // 너비 확보를 위해 수평 여백 증가
    height: 40, // GlobalVoiceButton과 높이 통일
    borderRadius: 10,
    justifyContent: 'center', // 텍스트 수직 중앙 정렬
  },
  cartButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
