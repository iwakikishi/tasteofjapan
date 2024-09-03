import { Animated, View, Text, SafeAreaView, TouchableOpacity, ScrollView, TouchableHighlight, Image } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [displayedPoints, setDisplayedPoints] = React.useState(0);

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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
      <SafeAreaView className='flex'>
        <View className='flex items-center justify-center h-full'>
          <View className='flex w-3/4 items-center justify-center bg-white h-44 py-10 mt-10 rounded-lg'>
            <Image source={require('@/assets/images/tasteofjapan_logo.jpg')} className='w-full h-full rounded-lg' resizeMode='contain' />
          </View>
          <View className='flex gap-2 items-center justify-center mt-10'>
            <Text className='text-3xl text-white'>Please create an account</Text>
            <Text className='text-3xl text-white'>or</Text>
            <Text className='text-3xl text-white'>login to continue</Text>

            <TouchableHighlight className='bg-white py-2 px-4 rounded-md mt-6' onPress={() => router.push('/login')}>
              <Text className='text-xl text-black'>Next</Text>
            </TouchableHighlight>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-col'>
      <ScrollView className='flex'>
        <View className='flex p-6'>
          <View className='flex gap-2'>
            <Text className='text-3xl font-bold text-white'>Hi, {user?.firstName}</Text>
            <Text className='text-xl text-white'>Welcome to Taste of Japan</Text>
          </View>
          {/* Points Section */}
          <View className='flex mt-5'>
            <View className='w-full h-60 justify-center bg-white border border-white p-2 rounded-xl gap-2 mt-4 shadow-lg shadow-slate-400'>
              <View className='flex w-1/2 h-20 mt-4'>
                <Image source={require('@/assets/images/tasteofjapan_logo.jpg')} className='w-full h-full rounded-lg' resizeMode='contain' />
              </View>
              <View className='flex-row w-full justify-end items-baseline mt-4 px-4'>
                <Text className='text-black text-5xl font-semibold mr-2'>{displayedPoints}</Text>
                <Text className='text-2xl text-black font-semibold'>Points</Text>
              </View>
            </View>
          </View>
          {/* Link Section */}
          <View className='flex my-10 gap-4 px-2'>
            <Link href='/tickets'>
              <View className='flex-row w-full items-center justify-between py-4 border-b border-white'>
                <Text className='text-white text-lg font-semibold'>Show Tickets</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </View>
            </Link>

            <Link href='/profile' className='flex'>
              <View className='flex-row w-full items-center justify-between py-4 border-b border-white'>
                <Text className='text-white text-lg font-semibold'>Edit Profile</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </View>
            </Link>

            <Link href='/about' className='flex'>
              <View className='flex-row w-full items-center justify-between py-4 border-b border-white'>
                <Text className='text-white text-lg font-semibold'>About us</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </View>
            </Link>

            <Link href='/yokocho' className='flex'>
              <View className='flex-row w-full items-center justify-between py-4 border-b border-white'>
                <Text className='text-white text-lg font-semibold'>Yokocho Fes</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </View>
            </Link>

            <Link href='/contact' className='flex'>
              <View className='flex-row w-full items-center justify-between py-4 border-b border-white'>
                <Text className='text-white text-lg font-semibold'>Contact</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </View>
            </Link>

            <View className='flex border-b border-white'>
              <TouchableOpacity className='flex-row items-center justify-between py-4 ' onPress={signOut}>
                <Text className='text-white text-lg font-semibold'>Logout</Text>
                <Ionicons name='chevron-forward' size={20} color='white' />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
