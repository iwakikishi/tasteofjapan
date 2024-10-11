import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import HeaderStack from '../components/HeaderStack';
import { StatusBar } from 'expo-status-bar';

const ThemedApp = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderStack />
    </View>
  );
};

export default ThemedApp;
