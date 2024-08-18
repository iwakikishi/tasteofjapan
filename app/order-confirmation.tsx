import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useTicketCart } from '@/context/CartContext';

export default function OrderConfirmationScreen() {
  const { ticketCart, setTicketCart } = useTicketCart();

  const onPressRemove = (index: number) => {
    setTicketCart(ticketCart.filter((_, i) => i !== index));
  };

  const total = ticketCart.reduce((acc, item) => acc + item.qty * (item.category === 'ADMISSION' ? 10 : 10), 0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className='flex-1'>
        <ScrollView className='flex p-6'>
          <View className='flex'>
            <Text className='text-2xl font-bold text-white'>Order Summary</Text>
          </View>
          <View className='flex mt-4'>
            {ticketCart.map((item, index) => (
              <View key={index} className='flex-row border-b border-gray-200 items-center justify-between py-6'>
                <View className='flex gap-2'>
                  <Text className='text-lg font-semibold text-white'>{item.category === 'ADMISSION' ? 'Admission Fee' : 'Sake Bundle'}</Text>
                  <Text className='text-sm text-white'>For {item.name}</Text>
                  <TouchableOpacity onPress={() => onPressRemove(index)}>
                    <Text className='text-sm text-blue-500'>Remove</Text>
                  </TouchableOpacity>
                </View>
                <View className='flex items-center gap-2'>
                  <Text className='text-lg font-semibold text-white'>{item.category === 'ADMISSION' ? '$10' : '$10'}</Text>
                  <Text className='text-lg font-bold text-white'>x {item.qty}</Text>
                </View>
              </View>
            ))}
            <View className='flex-row justify-between py-3'>
              <Text className='text-lg font-bold text-white'>Total</Text>
              <Text className='text-lg font-bold text-white'>${total}</Text>
            </View>
          </View>
        </ScrollView>
        <View className={`w-full p-4 absolute bottom-5 left-0 bg-black ${ticketCart.length === 0 ? 'hidden' : ''}`}>
          <TouchableOpacity className='w-full items-center justify-center bg-white py-3 rounded-full'>
            <Text className='text-lg font-bold text-black'>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
