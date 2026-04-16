import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalProvider } from './src/state/Store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <GlobalProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </GlobalProvider>
    </SafeAreaProvider>
  );
}
