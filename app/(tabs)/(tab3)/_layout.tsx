import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { HeaderRight } from '@/components/HeaderRight';
import { HeaderLeft } from '@/components/HeaderLeft';

export default function StageLayout() {
  const { colors } = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerShown: true,
          headerTitle: 'Tresure Hunt',
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
