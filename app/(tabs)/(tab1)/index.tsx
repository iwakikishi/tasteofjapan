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
import { useFoodCart, useTicketCart } from '@/context/CartContext';
import CountDown from '@/components/CountDown';

const timeUntil = Math.floor((new Date('2024-12-14T16:00:00-08:00').getTime() - new Date().getTime()) / 1000);

export default function HomeScreen() {
  const { user } = useAuth();
  const { foodCart } = useFoodCart();
  const { ticketCart } = useTicketCart();
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <SafeAreaView className='flex-1'>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#fff' }}
        headerImage={<Image source={require('@/assets/images/top.jpg')} style={styles.reactLogo} resizeMode='cover' />}>
        <View className='flex bg-black p-4'>
          <View className='flex-row justify-between items-center mt-4'>
            <View className='flex-row items-center'>
              <Text className='text-white text-3xl font-bold'>Welcome {user ? user.firstName : ''}!</Text>
              <HelloWave />
            </View>
          </View>
          <View className='flex'>
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
            <Text className='text-white text-xl font-bold'>December 14th</Text>
            <Text className='text-white text-xl font-bold'>December 15th</Text>
            <View className='flex my-8'>
              <Link href='/ticket' asChild>
                <TouchableOpacity className='h-12 bg-red-500 rounded-full items-center justify-center self-start px-8'>
                  <Text className='font-bold text-white text-lg'>Buy ticket - $10</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

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
        </View>
      </ParallaxScrollView>

      <View className={`${isAdmin ? 'flex' : 'hidden'} absolute bottom-2 left-4`}>
        <Link href='/qr-scan' asChild>
          <TouchableOpacity className='bg-blue-500 p-4 rounded-full'>
            <Ionicons name='camera' size={24} color='white' />
          </TouchableOpacity>
        </Link>
      </View>

      <View className={`${foodCart.length > 0 || ticketCart.length > 0 ? 'flex' : 'hidden'} absolute bottom-2 right-4`}>
        <Link href='/cart' asChild>
          <TouchableOpacity className='bg-red-500 p-4 rounded-full'>
            <Ionicons name='cart-outline' size={24} color='white' />
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
