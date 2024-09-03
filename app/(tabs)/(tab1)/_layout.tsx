import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

export default function _Layout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen
        name='goodie-bag'
        options={{
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name='food-preorder-page'
        options={{
          headerTitle: 'Pre Order',
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name='food-vendor-page' options={{ headerShown: false }} />
      <Stack.Screen
        name='ticket'
        options={{
          headerTitle: 'Admission Tickets',
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name='checkout'
        options={{
          headerTitle: 'Checkout',
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name='yokocho'
        options={{
          headerTitle: 'Yokocho Fest',
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name='qr-scan'
        options={{
          headerTitle: 'QR Scan',
          headerBackTitleVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
