import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='tickets' options={{ headerShown: true, headerTitle: 'My Tickets', headerBackTitleVisible: false }} />
      <Stack.Screen name='profile' options={{ headerShown: true, headerTitle: 'My Profile', headerBackTitleVisible: false }} />
    </Stack>
  );
}
