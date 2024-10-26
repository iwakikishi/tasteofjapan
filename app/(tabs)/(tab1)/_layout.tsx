import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { HeaderRight } from '@/components/HeaderRight';

export default function _Layout() {
  const { colors } = useTheme();

  const HeaderTitle = ({ title }: { title: string }) => (
    <Text className='text-lg font-NotoSansBold' style={{ color: colors.headerText }}>
      {title}
    </Text>
  );

  const BackButton = () => (
    <Pressable onPress={() => router.back()} className='p-2 rounded-full bg-black/20'>
      <Ionicons name='arrow-back' size={24} color={colors.headerText} />
    </Pressable>
  );

  const MapButton = () => (
    <Pressable onPress={() => router.push('/map')}>
      <Ionicons name='map-outline' size={24} color={colors.headerText} />
    </Pressable>
  );

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='' />,
          headerTitleStyle: {
            color: colors.headerText,
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'NotoSans-Bold',
          },
          headerRight: () => <HeaderRight />,
          headerLeft: MapButton,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name='goodie-bag'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTitle: () => <HeaderTitle title='Goodie Bag' />,
          headerTitleStyle: {
            color: colors.headerText,
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'NotoSans-Bold',
          },
          headerLeft: BackButton,
        }}
      />
      <Stack.Screen
        name='order-confirmation'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerTitle: () => <HeaderTitle title='' />,
          headerLeft: BackButton,
        }}
      />
      <Stack.Screen
        name='preorder-items-list'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='Pre Order' />,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: BackButton,
        }}
      />
      <Stack.Screen name='vendor' options={{ headerShown: false }} />

      <Stack.Screen
        name='ticket'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='Admission Tickets' />,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerRight: () => <HeaderRight />,
          headerLeft: BackButton,
        }}
      />
      <Stack.Screen
        name='checkout'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='Checkout' />,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: BackButton,
        }}
      />
      <Stack.Screen
        name='yokocho'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='Yokocho Fest' />,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerLeft: BackButton,
          headerRight: () => <HeaderRight />,
        }}
      />
      <Stack.Screen
        name='qr-scan'
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='QR Scan' />,
          headerBackTitleVisible: false,
          headerLeft: BackButton,
        }}
      />
    </Stack>
  );
}
