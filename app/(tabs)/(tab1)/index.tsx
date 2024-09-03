import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Switch, Pressable } from 'react-native';
import { Image } from 'expo-image';
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
  const [isHomePressed, setIsHomePressed] = useState(false);
  const [isYokochoPressed, setIsYokochoPressed] = useState(false);

  return (
    <SafeAreaView className='flex-1'>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#fff', dark: '#fff' }}
        headerImage={<Image source={require('@/assets/images/toj_image_540.jpeg')} style={styles.reactLogo} contentFit='cover' />}>
        <View className='flex bg-black'>
          {/* Welcome section */}
          <View className='flex bg-red-600 p-4'>
            <View className='flex-row justify-between items-center mt-4'>
              <View className='flex-row items-center'>
                <Text className='text-white text-3xl font-bold font-DMSans'>Welcome {user ? user.firstName : ''}!</Text>
                <HelloWave />
              </View>
            </View>
            <View className='flex gap-3 mt-4'>
              <Text className='text-white text-2xl font-bold' style={{ fontWeight: 'bold' }}>
                Dec. 14th (12pm - 9pm)
              </Text>
              <Text className='text-white text-2xl font-DMSans font-bold' style={{ fontWeight: 'bold' }}>
                Dec. 15th (12pm - 7pm)
              </Text>
              <View className='flex my-7 self-start'>
                <CountDown
                  size={24}
                  until={timeUntil}
                  onFinish={() => alert('Finished')}
                  digitStyle={{ backgroundColor: 'transparent', borderWidth: 2, borderColor: 'grey' }}
                  digitTxtStyle={{ color: '#1CC625' }}
                  timeLabelStyle={{ color: 'white', fontWeight: 'bold' }}
                  separatorStyle={{ color: 'grey' }}
                  timeToShow={['D', 'H', 'M', 'S']}
                  timeLabels={{ d: 'D', h: 'H', m: 'M', s: 'S' }}
                  // showSeparator
                />
              </View>
              <Text className='text-white text-xl font-bold'>HERITAGE SQUARE IN DOWNTOWN PHOENIX</Text>
              <Text className='text-white text-xl font-bold'>113 N 6th St. Phoenix, AZ 85004 </Text>
              <Pressable onPress={() => setIsHomePressed(!isHomePressed)}>
                <Text className={`text-white text-md  ${!isHomePressed && 'line-clamp-3'}`}>
                  Taste of Japan is thrilled to announce its return to Arizona for its second year! Following the success of our previous event in
                  Southern California, which attracted over 75,000 enthusiastic attendees, we are excited to bring this unique experience back to
                  Arizona once more! This year’s festivities will be bigger and better than ever, featuring an array of authentic Japanese foods, pop
                  culture experiences, live entertainment, merchandise, fun activities, and so much more! Whether you’re a family looking for a fun
                  day out, a food influencer eager to discover new culinary delights, or simply someone who loves Japanese culture, Taste of Japan has
                  something for everyone.
                </Text>
              </Pressable>
            </View>
            <View className='flex my-8'>
              <Link href='/ticket' asChild>
                <TouchableOpacity className='h-12 bg-white rounded-full items-center justify-center px-8'>
                  <Text className='font-bold text-black text-lg'>Buy EARLY BIRD ticket - $10</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Yokocho section */}
          <View className='mt-10 gap-4 p-4 rounded-md'>
            <View className='flex w-full'>
              <Image
                source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/welcometoyokocho.jpg?v=1724822477'}
                contentFit='contain'
                style={{ width: '100%', height: 200 }}
              />
            </View>
            <Pressable onPress={() => setIsYokochoPressed(!isYokochoPressed)}>
              <Text className={`text-white text-xl ${!isYokochoPressed && 'line-clamp-3'}`}>
                Yokocho means “alleyway” in Japanese. This special feature invites attendees to indulge in a full sake experience while learning about
                Japan’s local drinking culture. Walk-ins are welcome, but for those seeking an enhanced experience, our “Special Tasting tickets”
                offer Japanese Sake or Japanese Beer tasting and Tuna sashimi sampler!
              </Text>
            </Pressable>
            <View className='flex-row w-full'>
              <Link href='/ticket' asChild>
                <TouchableOpacity className='w-1/2 h-14 rounded-lg bg-red-500 justify-center items-center'>
                  <Text className='text-white text-xl'>Buy Tickets</Text>
                </TouchableOpacity>
              </Link>
              <Link href='/yokocho' asChild>
                <TouchableOpacity className='w-1/2 h-14 justify-center items-center'>
                  <Text className='text-white text-xl'>Learn more</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Pre-order section */}
          <View className='flex p-4 mt-10'>
            <TitleComponent title='Food Pre-order' category='Food' />
            <FoodPreOrderHorizontalScrollView />
          </View>

          {/* Goodie section */}
          <View className='flex mt-10'>
            <Image source={require('@/assets/images/goodie.jpg')} contentFit='contain' className='w-full h-[500px]' />
            <Link href='/goodie-bag' asChild>
              <TouchableOpacity className='w-full h-14 rounded-lg bg-blue-500 justify-center items-center'>
                <ThemedText type='defaultSemiBold'>Buy</ThemedText>
              </TouchableOpacity>
            </Link>
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
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
