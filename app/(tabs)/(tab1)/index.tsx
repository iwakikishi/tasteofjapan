import { Image, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Switch } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TitleComponent from '@/components/TitleComponent';
import { Link } from 'expo-router';
import FoodPreOrderHorizontalScrollView from '@/components/FoodPreOrderHorizontalScrollView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import CountDown from '@/components/CountDown';

const timeUntil = Math.floor((new Date('2024-12-14T16:00:00-08:00').getTime() - new Date().getTime()) / 1000);

export default function HomeScreen() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#fff' }}
        headerImage={<Image source={require('@/assets/images/top.jpg')} style={styles.reactLogo} resizeMode='cover' />}>
        <View className='flex-row justify-between items-center mt-4'>
          <View className='flex-row items-center'>
            <ThemedText type='title'>Welcome {user ? user.firstName : ''}!</ThemedText>
            <HelloWave />
          </View>
        </View>
        <ThemedView style={styles.stepContainer}>
          <View className='flex my-7 self-start'>
            <CountDown
              size={24}
              until={timeUntil}
              onFinish={() => alert('Finished')}
              digitStyle={{ backgroundColor: '#FFF', borderWidth: 2, borderColor: '#1CC625' }}
              digitTxtStyle={{ color: '#1CC625' }}
              timeLabelStyle={{ color: 'white', fontWeight: 'bold' }}
              separatorStyle={{ color: '#1CC625' }}
              timeToShow={['D', 'H', 'M', 'S']}
              timeLabels={{ d: 'D', h: 'H', m: 'M', s: 'S' }}
              // showSeparator
            />
          </View>
          <ThemedText type='subtitle'>December 14th</ThemedText>
          <ThemedText type='subtitle'>December 15th</ThemedText>
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
        <View className='mt-10 gap-4'>
          <View className='flex-row justify-between'>
            <View className='w-1/2'>
              <Image source={require('@/assets/images/yokocho_1.jpg')} resizeMode='contain' className='w-full h-[200px]' />
              <ThemedText type='subtitle' className='mt-2 text-center'>
                Yokocho
              </ThemedText>
            </View>
            <View className='w-1/2'>
              <Image source={require('@/assets/images/yokocho_2.jpg')} resizeMode='contain' className='w-full h-[200px]' />
              <ThemedText type='subtitle' className='mt-2 text-center'>
                Yokocho
              </ThemedText>
            </View>
          </View>
        </View>

        {/* admin switch */}
        <View className='flex '>
          <ThemedText type='subtitle'>Admin</ThemedText>
          <Switch value={isAdmin} onValueChange={setIsAdmin} />
        </View>
      </ParallaxScrollView>

      <View className={`${isAdmin ? 'flex' : 'hidden'} absolute bottom-2 right-2`}>
        <Link href='/qr-scan' asChild>
          <TouchableOpacity className='bg-red-500 p-4 rounded-full'>
            <Ionicons name='camera' size={24} color='white' />
          </TouchableOpacity>
        </Link>
      </View>
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
