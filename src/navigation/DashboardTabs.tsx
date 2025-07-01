// src/navigation/DashboardTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import LogMealScreen from '../screens/LogMealScreen';
import SetGoalScreen from '../screens/SetGoalScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function DashboardTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') iconName = 'home';
          else if (route.name === 'LogMeal') iconName = 'restaurant';
          else if (route.name === 'SetGoal') iconName = 'locate';
          else iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1B5E20', // Dark green
        },
        headerTitleStyle: {
          color: '#ffffff',           // White text
          fontWeight: 'bold',
          fontSize: 20,
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{
        tabBarLabel: 'Dashboard',
        headerTitle: 'CalorieCompass',
        headerStyle: {
          backgroundColor: '#1B5E20', // your custom color
        },
        headerTintColor: '#fff', // white text/icons
      }} />
      <Tab.Screen name="LogMeal" component={LogMealScreen} options={{
        tabBarLabel: 'Log Meal',
        headerTitle: 'CalorieCompass',
        headerStyle: {
          backgroundColor: '#1B5E20', // your custom color
        },
        headerTintColor: '#fff', // white text/icons
      }} />
      <Tab.Screen name="SetGoal" component={SetGoalScreen} options={{
        tabBarLabel: 'Set Goal',
        headerTitle: 'CalorieCompass',
        headerStyle: {
          backgroundColor: '#1B5E20', // your custom color
        },
        headerTintColor: '#fff', // white text/icons
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile',
        headerTitle: 'CalorieCompass',
        headerStyle: {
          backgroundColor: '#1B5E20', // your custom color
        },
        headerTintColor: '#fff', // white text/icons
      }} />
    </Tab.Navigator>
  );
}
