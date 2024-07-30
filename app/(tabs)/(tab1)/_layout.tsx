import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='descriptions' options={{ headerBackTitleVisible: false }} />
      <Stack.Screen name='food-preorder-page' options={{ headerTitle: 'Pre Order', headerBackTitleVisible: false }} />
      <Stack.Screen name='food-vendor-page' options={{ headerTitle: 'Pre Order', headerBackTitleVisible: false }} />
    </Stack>
  );
}
