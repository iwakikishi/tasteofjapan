import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { HeaderRight } from '@/components/HeaderRight';
import { HeaderLeft } from '@/components/HeaderLeft';
import { HeaderTitle } from '@/components/HeaderTitle';

export default function StageLayout() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Tresure Hunt' />,
          headerTitleAlign: 'left',
          headerRight: () => <HeaderRight />,
          headerLeft: () => <HeaderLeft />,
        }}
      />
    </Stack>
  );
}
