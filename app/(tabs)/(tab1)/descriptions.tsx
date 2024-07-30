import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Dimensions, Image, Text, Button, TouchableOpacity, View, ScrollView, Pressable } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { ProductCarousel } from '@/components/ProductCarousel';

export default function DescriptionsScreen() {
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const router = useRouter();
  const PAGE_WIDTH = Dimensions.get('window').width;

  const onPressBuy = () => {
    console.log(user);
    if (!user) {
      router.push('/login');
    } else {
      setShowPayment(true);
    }
  };

  return (
    <ScrollView className='flex'>
      <View className='w-full'>
        <ProductCarousel />
      </View>
      <View className='flex p-6'>
        <Text className='text-white text-2xl font-bold'>TASTE OF JAPAN</Text>
        <Text className='text-white text-2xl font-bold'>2024 GOODIE BAG</Text>
        <View className='flex mt-4 gap-2'>
          <Text className='text-white text-xl font-bold'>Includes:</Text>
          <Text className='text-white text-lg'>- 1x Goodie bag</Text>
          <Text className='text-white text-lg'>- 1x Goodie bag</Text>
          <Text className='text-white text-lg'>- 1x Goodie bag</Text>
          <Text className='text-white text-lg'>- 1x Goodie bag</Text>
          <Text className='text-white text-lg'>- 1x Goodie bag</Text>
          <Text className='text-white text-lg'>- 1x Goodie bag</Text>
        </View>
      </View>
      <View className='flex py-10 justify-center items-center'>
        <TouchableOpacity className='bg-red-600 p-4 rounded-md w-2/3' onPress={onPressBuy}>
          <Text className='text-white text-center text-xl font-bold'>Buy now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
