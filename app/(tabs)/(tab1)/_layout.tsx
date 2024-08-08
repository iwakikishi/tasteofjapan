import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function _Layout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='goodie-bag' options={{ headerBackTitleVisible: false }} />
      <Stack.Screen name='food-preorder-page' options={{ headerTitle: 'Pre Order', headerBackTitleVisible: false }} />
      <Stack.Screen name='food-vendor-page' options={{ headerTitle: 'Pre Order', headerBackTitleVisible: false }} />
      <Stack.Screen name='ticket' options={{ headerTitle: 'Ticket', headerBackTitleVisible: false }} />
      <Stack.Screen name='qr-scan' options={{ headerTitle: 'QR Scan', headerBackTitleVisible: false }} />
    </Stack>
  );
}
