import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import IntroSplash from './screens/IntroSplash';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';

import { HistoryProvider } from './context/HistoryContext';

// Dashboard & Home için ortak mod tipi
export type ScanMode = 'qr' | 'barcode' | 'document';

export type RootStackParamList = {
  Intro: undefined;
  Splash: undefined;
  // Dashboard Home'a geçerken burada initialMode gönderiyor
  Home: { initialMode?: ScanMode } | undefined;
  Dashboard: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <HistoryProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Intro"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Intro" component={IntroSplash} />
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </HistoryProvider>
    </SafeAreaProvider>
  );
}

export default App;
