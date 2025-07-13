import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text, View } from 'react-native';

import { AppInfo } from '../components/AppInfo';
import type { MainTabParamList } from '../types/navigation';

const MainTab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens for now
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title} Screen</Text>
    <Text style={{ marginTop: 10, color: '#666' }}>Coming soon!</Text>
  </View>
);

const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <AppInfo title='Plastic Crack' version='1.0.0' />
    <Text
      style={{
        marginTop: 20,
        textAlign: 'center',
        color: '#666',
        paddingHorizontal: 20,
      }}
    >
      Track and identify plastic items with your camera. Start by navigating to
      the Camera tab to scan items.
    </Text>
  </View>
);
const CollectionsScreen = () => <PlaceholderScreen title='Collections' />;
const CameraScreen = () => <PlaceholderScreen title='Camera' />;
const SearchScreen = () => <PlaceholderScreen title='Search' />;
const ProfileScreen = () => <PlaceholderScreen title='Profile' />;

export function MainTabNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        headerShown: true,
      }}
      initialRouteName='Home'
    >
      <MainTab.Screen
        name='Home'
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          // TODO: Add icon when react-native-vector-icons is configured
        }}
      />
      <MainTab.Screen
        name='Collections'
        component={CollectionsScreen}
        options={{
          tabBarLabel: 'Collections',
          // TODO: Add icon
        }}
      />
      <MainTab.Screen
        name='Camera'
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          // TODO: Add icon
        }}
      />
      <MainTab.Screen
        name='Search'
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          // TODO: Add icon
        }}
      />
      <MainTab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          // TODO: Add icon
        }}
      />
    </MainTab.Navigator>
  );
}
