import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, SafeAreaView, TouchableOpacity, ScrollView, TouchableHighlight, Dimensions } from 'react-native';
import { Image, ImageBackground } from 'expo-image';
import { useTheme } from '@/context/ThemeContext';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const deviceWidth = Dimensions.get('window').width;

export default function AccountScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const [displayedPoints, setDisplayedPoints] = useState(0);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const animation = useRef<LottieView>(null);

  // useEffect(() => {
  //   signOut();
  // }, []);

  useEffect(() => {
    if (user?.points) {
      Animated.timing(animatedValue, {
        toValue: user.points,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [user?.points]);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayedPoints(Math.floor(value));
    });
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  if (!user) {
    return (
      <SafeAreaView className='flex' style={{ backgroundColor: colors.background }}>
        <View className='flex-col h-full' style={{ backgroundColor: colors.background }}>
          <Image
            source={{
              uri: 'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/TOJ_banner_mobile.jpg?v=1726212548',
            }}
            contentFit='contain'
            style={{ width: deviceWidth, height: deviceWidth * 0.56 }}
          />
          <View className='flex gap-2'>
            <View className='flex-col p-6' style={{ backgroundColor: 'red' }}>
              <Text className='text-3xl text-white font-NotoSansBold'>Thank you for your interest in Taste of Japan!</Text>
            </View>
            <View className='flex-col mt-8 gap-2 px-6'>
              <Text className='text-3xl text-white font-DMSansItalic'>Please create an account</Text>
              <Text className='text-3xl text-white font-DMSansItalic'>or</Text>
              <Text className='text-3xl text-white font-DMSansItalic'>login to continue</Text>
              <Link href='/login' asChild>
                <TouchableHighlight className='bg-white py-2 px-4 rounded-md mt-10 self-start'>
                  <Text className='text-xl text-black font-NotoSansBold'>Next</Text>
                </TouchableHighlight>
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <ScrollView className='flex' style={{ backgroundColor: colors.background }}>
        <View className='flex p-4 gap-6'>
          {/* Points Section */}
          <View className='flex-col'>
            <View className='w-full h-48 bg-white rounded-2xl overflow-visible border-1 border-red-600 shadow-red-300 shadow-lg'>
              <View className='w-full h-full rounded-2xl overflow-hiddenrelative'>
                <Image source={require('@/assets/images/heritage_square.jpg')} style={{ width: '100%', height: '100%', opacity: 0.2 }} />
                <View className='absolute top-2 left-4'>
                  <Image source={require('@/assets/images/TOJ_logo_transparent.png')} style={{ width: 110, height: 110 }} contentFit='contain' />
                </View>
                <View className='absolute top-9 right-4'>
                  <LottieView source={require('@/assets/lottie/point_card_animation.json')} autoPlay loop style={{ width: 60, height: 60 }} />
                </View>
                <View className='flex-row absolute right-4 bottom-2 items-center justify-center'>
                  <Text className='text-slate-700 text-5xl font-serif font-bold pb-2'>{displayedPoints}</Text>
                  <Text className='text-slate-700 text-md font-NotoSansBold'> Points</Text>
                </View>
              </View>
            </View>
          </View>
          <View className='flex-col'></View>
          {/* User Section */}
          <View className='flex-col gap-1 px-2'>
            <Text className='text-3xl font-bold text-white font-NotoSansBold'>Hi, {user?.firstName}</Text>
            <View className='flex-row items-center'>
              <Ionicons name='mail-outline' size={20} color={'white'} className='mr-2' />
              <Text className='text-xl text-white font-NotoSans'>{user?.email}</Text>
            </View>
          </View>

          {/* Admin Section */}
          {/* {user?.isAdmin && (
            <View className='flex mt-7 px-2'>
              <Link href='/scan-tickets' asChild>
                <TouchableOpacity className='flex-row bg-sky-600 self-start items-center p-4 rounded-md gap-2'>
                  <Ionicons name='scan' size={20} color='white' />
                  <Text className='text-white text-xl font-semibold'>Scan Tickets for Admin</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )} */}

          {/* Link Section */}
          <View className='flex-col mb-10 mt-6'>
            <Text className='text-2xl text-white font-NotoSansBold ml-2 mb-4'>Account Menus</Text>
            <View className='flex-col px-4 bg-slate-950 rounded-lg'>
              <Link href='/tickets' asChild>
                <TouchableOpacity className='flex-row w-full items-center justify-between py-3'>
                  <Text className='text-white text-lg font-NotoSans'>Show Tickets</Text>
                  <Ionicons name='chevron-forward' size={20} color='white' />
                </TouchableOpacity>
              </Link>

              {/* <Link href='/profile' asChild>
              <TouchableOpacity className='flex-row w-full items-center justify-between py-4 border-b border-gray-600'>
                <Text className='text-white text-lg font-semibold'>Edit Profile</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </TouchableOpacity>
            </Link> */}

              <Link href='/redeem' asChild>
                <TouchableOpacity className='flex-row w-full items-center justify-between py-3'>
                  <Text className='text-white text-lg font-NotoSans'>Redeem points</Text>
                  <Ionicons name='chevron-forward' size={20} color='white' />
                </TouchableOpacity>
              </Link>

              <Link href='https://169cf3-1c.myshopify.com/policies/privacy-policy' asChild>
                <TouchableOpacity className='flex-row w-full items-center justify-between py-3'>
                  <Text className='text-white text-lg font-NotoSans'>Privacy Policy</Text>
                  <Ionicons name='chevron-forward' size={20} color='white' />
                </TouchableOpacity>
              </Link>

              <Link href='https://www.tasteofjpn.com/pages/contact' asChild>
                <TouchableOpacity className='flex-row w-full items-center justify-between py-3'>
                  <Text className='text-white text-lg font-NotoSans'>Contact</Text>
                  <Ionicons name='chevron-forward' size={20} color='white' />
                </TouchableOpacity>
              </Link>

              <View className='flex'>
                <TouchableOpacity className='flex-row items-center justify-between py-3' onPress={signOut}>
                  <Text className='text-white text-lg font-NotoSans'>Logout</Text>
                  <Ionicons name='chevron-forward' size={20} color='white' />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
