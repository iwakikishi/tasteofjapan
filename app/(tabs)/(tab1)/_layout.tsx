import { Stack } from 'expo-router';

export default function _Layout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='goodie-bag' options={{ headerBackTitleVisible: false }} />
      <Stack.Screen name='food-preorder-page' options={{ headerTitle: 'Pre Order', headerBackTitleVisible: false }} />
      <Stack.Screen name='food-vendor-page' options={{ headerShown: false }} />
      <Stack.Screen name='ticket' options={{ headerTitle: 'Ticket', headerBackTitleVisible: false }} />
      <Stack.Screen name='checkout' options={{ headerTitle: 'Checkout', headerBackTitleVisible: false }} />
      <Stack.Screen name='qr-scan' options={{ headerTitle: 'QR Scan', headerBackTitleVisible: false }} />
    </Stack>
  );
}
