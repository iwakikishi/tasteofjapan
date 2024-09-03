import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    DMSans: require('../assets/fonts/DMSans-VariableFont_opsz,wght.ttf'),
    DMSansItalic: require('../assets/fonts/DMSans-Italic-VariableFont_opsz,wght.ttf'),
  });

  const client = new ApolloClient({
    uri: `https://${process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/graphql`,
    headers: {
      'X-Shopify-Storefront-Access-Token': process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    },
    cache: new InMemoryCache(),
  });

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
      <ApolloProvider client={client}>
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
      </ApolloProvider>
    </ThemeProvider>
  );
}
