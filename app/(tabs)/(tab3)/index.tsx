import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { HelloWave } from '@/components/HelloWave';

export default function SearchScreen() {
  const { colors } = useTheme();

  const openWebBrowser = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <View className='flex justify-center items-center gap-3'>
        <Image
          source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/IMG_9792-4.jpg?v=1727136743'}
          contentFit='cover'
          style={{ width: '100%', height: 250 }}
        />
        <View className='p-4'>
          <View className='flex gap-3'>
            <Text className='text-white text-lg font-NotoSans'>EARN</Text>
            <Text className='text-white text-3xl font-NotoSansBold'>500 Points</Text>
            <Text className='text-white text-lg font-NotoSans'>
              Play our Treasure Hunt! Explore all over Taste of Japan event, and earn 500 Points for each Checkpoint achieved!
            </Text>
          </View>
          <View className='flex mt-12 gap-12'>
            <View className='flex-row bg-transparent self-start border border-slate-300 py-3 pl-2 pr-4 rounded-lg items-center justify-center'>
              <HelloWave />
              <Text className='text-white text-lg font-NotoSansBold ml-2'>See you at the event</Text>
            </View>
            <TouchableOpacity
              className='bg-slate-300 self-start py-3 px-4 rounded-lg items-center justify-center'
              onPress={() => openWebBrowser('https://www.tasteofjpn.com/pages/taste-of-japan-app')}>
              <Text className='text-black text-lg font-NotoSansBold'>Learn more about the rewards</Text>
            </TouchableOpacity>
          </View>
          {/* {user?.id ? (
            <TouchableOpacity className='bg-red-500 py-3 px-4 rounded-full items-center justify-center'>
              <Text className='text-white text-lg font-NotoSansBold'>Start</Text>
            </TouchableOpacity>
          ) : (
            <Link href='/login' asChild>
              <TouchableOpacity className='bg-red-500 py-3 px-4 rounded-full items-center justify-center'>
                <Text className='text-white text-lg font-NotoSansBold'>Create an account</Text>
              </TouchableOpacity>
            </Link>
          )} */}
        </View>
      </View>
    </SafeAreaView>
  );
}
