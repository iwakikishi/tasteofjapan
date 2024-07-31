import { Image, StyleSheet, Platform, Text, Button, ScrollView, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TitleComponent from '@/components/TitleComponent';
import { Link } from 'expo-router';
import FoodPreOrderHorizontalScrollView from '@/components/FoodPreOrderHorizontalScrollView';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#fff' }}
        headerImage={<Image source={require('@/assets/images/top.jpg')} style={styles.reactLogo} resizeMode='cover' />}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type='title'>Welcome!</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type='subtitle'>December 14th</ThemedText>
          <ThemedText type='subtitle'>December 15th</ThemedText>
          {/* How to use ThemedText */}
          {/* <ThemedText type='subtitle'>Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type='defaultSemiBold'>app/(tabs)/index.tsx</ThemedText> to see changes. Press{' '}
          <ThemedText type='defaultSemiBold'>{Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}</ThemedText> to open developer tools.
        </ThemedText> */}
          <View className='flex my-8'>
            <Link href='/ticket' asChild>
              <TouchableOpacity className='h-12 bg-red-500 rounded-full items-center justify-center px-8'>
                <Text className='font-bold text-white text-lg'>Buy ticket - $10</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ThemedView>

        {/* Pre-order section */}
        <View className='flex mt-10'>
          <TitleComponent title='Food Pre-order' category='Food' />
          <FoodPreOrderHorizontalScrollView />
        </View>

        {/* Goodie section */}
        <View className='flex mt-10'>
          <Image source={require('@/assets/images/goodie.jpg')} resizeMode='contain' className='w-full h-[500px]' />
          <Link href='/goodie-bag' asChild>
            <TouchableOpacity className='w-full h-14 rounded-lg bg-blue-500 justify-center items-center'>
              <ThemedText type='defaultSemiBold'>Buy</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Yokocho section */}
        <ThemedView style={styles.stepContainer} className='mt-10'>
          <ThemedView className='flex-row justify-between'>
            <ThemedView className='w-1/2'>
              <Image source={require('@/assets/images/yokocho_1.jpg')} resizeMode='contain' className='w-full h-[200px]' />
              <ThemedText type='subtitle' className='mt-2 text-center'>
                Yokocho
              </ThemedText>
            </ThemedView>
            <ThemedView className='w-1/2'>
              <Image source={require('@/assets/images/yokocho_2.jpg')} resizeMode='contain' className='w-full h-[200px]' />
              <ThemedText type='subtitle' className='mt-2 text-center'>
                Yokocho
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepContainer: {
    gap: 4,
    marginBottom: 8,
  },
  reactLogo: {
    height: 500,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
