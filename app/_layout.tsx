import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import ApolloProviderWrapper from '@/providers/ApolloProviderWrapper';
import SplashScreenHandler from '@/components/SplashScreenHandler';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import ThemedApp from '@/components/ThemedApp';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ApolloProviderWrapper>
        <AuthProvider>
          <CartProvider>
            <SplashScreenHandler>
              <ActionSheetProvider>
                <ThemedApp />
              </ActionSheetProvider>
            </SplashScreenHandler>
          </CartProvider>
        </AuthProvider>
      </ApolloProviderWrapper>
    </ThemeProvider>
  );
}
