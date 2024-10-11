import React, { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

const SplashScreenHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontsLoaded, fontError] = useFonts({
    DMSans: require('../assets/fonts/DMSans-VariableFont_opsz,wght.ttf'),
    DMSansItalic: require('../assets/fonts/DMSans-Italic-VariableFont_opsz,wght.ttf'),
    NotoSans: require('../assets/fonts/NotoSans-Regular.ttf'),
    NotoSansBold: require('../assets/fonts/NotoSans-Bold.ttf'),
    NotoSandsItalic: require('../assets/fonts/NotoSans-Italic.ttf'),
  });

  const hideSplashScreen = useCallback(async () => {
    if (fontsLoaded || fontError) {
      try {
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Failed to hide splash screen:', error);
      }
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    hideSplashScreen();
  }, [fontsLoaded, fontError, hideSplashScreen]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return <>{children}</>;
};

export default SplashScreenHandler;
