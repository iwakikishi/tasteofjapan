import { Stack } from 'expo-router';
import { HeaderLeft } from '@/components/HeaderLeft';
import { HeaderRight } from '@/components/HeaderRight';
import { HeaderTitle } from '@/components/HeaderTitle';
import { useTheme } from '@/context/ThemeContext';

export default function OrdersLayout() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Orders' />,
          headerTitleAlign: 'left',
          headerRight: () => <HeaderRight />,
          headerLeft: () => <HeaderLeft />,
        }}
      />
    </Stack>
  );
}
