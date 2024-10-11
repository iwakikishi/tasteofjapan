import { Stack } from 'expo-router';
import { HeaderLeft } from '@/components/HeaderLeft';
import { HeaderRight } from '@/components/HeaderRight';
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
          headerTitle: '',
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
