import { Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { HeaderRight } from '@/components/HeaderRight';

const HeaderStack = () => {
  const { colors } = useTheme();
  const router = useRouter();

  const HeaderTitle = ({ title }: { title: string }) => (
    <Text className='text-xl font-bold' style={{ color: colors.headerText }}>
      {title}
    </Text>
  );

  const HeaderLeft = () => (
    <TouchableOpacity
      className=' bg-black/20 rounded-full p-2 justify-center items-center'
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          // 代替アクション（例：ホーム画面への遷移）
          router.push('/');
        }
      }}>
      <Ionicons name='close' size={24} color={colors.headerText} />
    </TouchableOpacity>
  );

  return (
    <Stack initialRouteName='(tabs)'>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen
        name='login'
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Welcome' />,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerLeft: () => <HeaderLeft />,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name='verification'
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Verification' />,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name='register'
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name='login-callback'
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Authentication' />,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name='product-detail'
        options={{
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: colors.headerText,
          headerTitle: () => <HeaderTitle title='' />,
          headerBackVisible: false,
          headerBackTitleVisible: false,
          headerRight: () => <HeaderRight />,
          headerLeft: () => <HeaderLeft />,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name='order-history'
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Order History' />,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerLeft: () => <HeaderLeft />,
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name='thanks'
        options={{
          headerShown: false,
          headerTitle: () => <HeaderTitle title='Cart' />,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name='notifications'
        options={{
          headerShown: true,
          headerTitle: () => <HeaderTitle title='Notifications' />,
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.headerText,
          headerLeft: () => <HeaderLeft />,
          headerBackTitleVisible: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen name='+not-found' />
    </Stack>
  );
};

export default HeaderStack;
