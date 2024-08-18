import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useFoodCart } from '@/context/CartContext';
import { Image } from 'expo-image';

export default function CheckoutScreen() {
  const { foodCart, setFoodCart } = useFoodCart();

  const onPressRemove = (index: number) => {
    setFoodCart(foodCart.filter((_, i) => i !== index));
  };

  const total = foodCart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className='flex-1'>
        {foodCart.length > 0 ? (
          <ScrollView className='flex p-6'>
            <View className='flex mt-4'>
              {foodCart.map((item, index) => (
                <View key={index} className='flex-col'>
                  {(index === 0 ||
                    (item.vendor?.name && foodCart[index - 1]?.vendor?.name && item.vendor.name !== foodCart[index - 1].vendor.name)) && (
                    <View className='flex'>
                      <Text className='text-xl font-semibold text-white'>{item.vendor?.name || 'Unknown Vendor'}</Text>
                    </View>
                  )}
                  <View key={index} className='flex-row border-b border-gray-200 items-center justify-between py-6'>
                    <View className='flex-row items-center gap-2'>
                      <View className='w-12 h-12 rounded-xl mr-2 overflow-hidden'>
                        <Image source={{ uri: item.images[0].uri }} style={{ width: '100%', height: '100%' }} contentFit='cover' />
                      </View>
                      <View className='flex flex-col gap-2'>
                        <Text className='text-xl font-semibold text-white'>{item.name}</Text>
                        <TouchableOpacity onPress={() => onPressRemove(index)}>
                          <Text className='text-sm text-red-500'>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View className='flex items-center gap-2'>
                      <Text className='text-lg font-semibold text-white'>${item.price}</Text>
                      <Text className='text-lg font-bold text-white'>x {item.quantity}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <View className='flex-row justify-between py-3'>
                <Text className='text-2xl font-bold text-white'>Total</Text>
                <Text className='text-2xl font-bold text-white'>${total}</Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View className='flex-1 items-center justify-center'>
            <Text className='text-2xl font-bold text-white'>Your cart is empty</Text>
          </View>
        )}
        <View className={`w-full p-4 absolute bottom-5 left-0 bg-black ${foodCart.length === 0 ? 'hidden' : ''}`}>
          <TouchableOpacity className='w-full items-center justify-center bg-white py-3 rounded-full'>
            <Text className='text-lg font-bold text-black'>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
