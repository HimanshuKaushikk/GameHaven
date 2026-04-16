import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import GameSelectionScreen from '../screens/GameSelectionScreen';
import GamePlayScreen from '../screens/GamePlayScreen';
import TournamentResultScreen from '../screens/TournamentResultScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#16213e' },
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="GameSelection" 
          component={GameSelectionScreen} 
        />
        <Stack.Screen 
          name="GamePlay" 
          component={GamePlayScreen} 
        />
        <Stack.Screen 
          name="TournamentResult" 
          component={TournamentResultScreen} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
