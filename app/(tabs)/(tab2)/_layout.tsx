import React from 'react';
import { Stack } from 'expo-router';
import { HeaderRight } from '@/components/HeaderRight';
import { HeaderLeft } from '@/components/HeaderLeft';
import { useTheme } from '@/context/ThemeContext';

export default function SearchLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
      }}>
      <Stack.Screen
        name='index'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerShown: true,
          headerTitle: 'Taste of Japan',
          headerTitleAlign: 'left',
          headerTitleStyle: {
            color: colors.headerText,
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'NotoSerifJP-Bold',
          },
          headerRight: () => <HeaderRight />,
          headerLeft: () => <HeaderLeft />,
        }}
      />
    </Stack>
  );
}
