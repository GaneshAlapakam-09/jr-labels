// BottomTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigatorScreenParams } from '@react-navigation/native';

import Dashboard from '../screens/Dashboard';
import ListItems from '../screens/ListItems';
import AddItem from '../screens/AddItem';
import Bluetooth from '../screens/Bluetooth';
import SetLabel from '../screens/SetLabel';

// Define your parameter types for all screens
type RootTabParamList = {
  Dashboard: { userId: number };
  List: { userId: number };
  Bluetooth: { userId: number };
  SetLabel: { userId: number };
};

type ListStackParamList = {
  ListMain: { userId: number };
  AddItem: { userId: number };
};

interface BottomTabsProps {
  userId: number;
}

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<ListStackParamList>();

function ListStack({ userId }: { userId: number }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListMain" 
        component={ListItems} 
        initialParams={{ userId }}
        options={{ title: 'Items' }} 
      />
      <Stack.Screen 
        name="AddItem" 
        component={AddItem} 
        initialParams={{ userId }}
        options={{ title: 'Add Item' }} 
      />
    </Stack.Navigator>
  );
}

export default function BottomTabs({ userId }: BottomTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'dashboard';

          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'List') iconName = 'list';
          else if (route.name === 'Bluetooth') iconName = 'bluetooth';
          else if (route.name === 'SetLabel') iconName = 'label';

          return <Icon name={iconName} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        initialParams={{ userId }}
      />
      <Tab.Screen 
        name="List" 
        children={() => <ListStack userId={userId} />}
      />
      <Tab.Screen 
        name="Bluetooth" 
        component={Bluetooth} 
        initialParams={{ userId }}
      />
      <Tab.Screen 
        name="SetLabel" 
        component={SetLabel} 
        initialParams={{ userId }}
      />
    </Tab.Navigator>
  );
}