import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { RootStackParamList } from '../types/navigation';

import { AuthStackNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  // TODO: Add authentication state management
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
      >
        {!isAuthenticated ? (
          <RootStack.Screen name='Auth' component={AuthStackNavigator} />
        ) : (
          <RootStack.Screen name='Main' component={MainTabNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
