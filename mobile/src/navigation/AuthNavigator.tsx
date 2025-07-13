import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { AuthStackParamList } from '../types/navigation';

// Import screens when they're created
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// Placeholder screens for now
const PlaceholderScreen = () => null;

export function AuthStackNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen 
        name="Login" 
        component={PlaceholderScreen} 
        options={{ title: 'Sign In' }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={PlaceholderScreen} 
        options={{ title: 'Sign Up' }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={PlaceholderScreen} 
        options={{ title: 'Reset Password' }}
      />
    </AuthStack.Navigator>
  );
}
