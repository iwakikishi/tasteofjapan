import React from 'react';
import { Stack } from 'expo-router';
import { HeaderRight } from '@/components/HeaderRight';
import { HeaderLeft } from '@/components/HeaderLeft';
import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';

export default function AccountLayout() {
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
          headerTitle: 'Account',
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
      <Stack.Screen name='tickets' options={{ headerShown: true, headerTitle: 'My Tickets', headerBackTitleVisible: false }} />
      <Stack.Screen name='profile' options={{ headerShown: true, headerTitle: 'My Profile', headerBackTitleVisible: false }} />
      <Stack.Screen name='scan-tickets' options={{ headerShown: true, headerTitle: 'Scan Tickets', headerBackTitleVisible: false }} />
      <Stack.Screen name='redeem' options={{ headerShown: true, headerTitle: 'Redeem Points', headerBackTitleVisible: false }} />
      <Stack.Screen
        name='contact'
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitleVisible: false,
        }}
      />
    </Stack>
  );
}
