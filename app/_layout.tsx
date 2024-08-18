import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <Stack initialRouteName='(tabs)'>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='login' options={{ headerShown: true, headerTitle: 'Sign up', headerBackTitleVisible: false }} />
            <Stack.Screen
              name='register'
              options={{ headerShown: true, headerTitle: 'Sign up', headerBackVisible: false, headerBackTitleVisible: false }}
            />
            <Stack.Screen name='login-callback' options={{ headerShown: true, headerTitle: 'Verification', headerBackTitleVisible: false }} />
            <Stack.Screen
              name='order-confirmation'
              options={{ headerShown: true, headerTitle: 'Order Confirmation', headerBackTitleVisible: false }}
            />
            <Stack.Screen name='+not-found' />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
