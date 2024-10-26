import React from 'react';
import { Stack } from 'expo-router';
import { HeaderRight } from '@/components/HeaderRight';
import { HeaderLeft } from '@/components/HeaderLeft';
import { useTheme } from '@/context/ThemeContext';
import { Text } from 'react-native';

export default function AccountLayout() {
  const { colors } = useTheme();

  const HeaderTitle = ({ title }: { title: string }) => (
    <Text className='text-lg font-NotoSansBold' style={{ color: colors.headerText }}>
      {title}
    </Text>
  );

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
          headerTitle: () => <HeaderTitle title='Account' />,
          headerTitleAlign: 'left',
          headerTitleStyle: {
            color: colors.headerText,
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'NotoSans-Bold',
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
