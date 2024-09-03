import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Dimensions, Text, TouchableOpacity, View, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Image } from 'expo-image';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { ProductCarousel } from '@/components/ProductCarousel';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTicketCart } from '@/context/CartContext';

const ticketQty = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const deviceWidth: number = Dimensions.get('window').width;

export default function TicketScreen() {
  const { user } = useAuth();
  const { ticketCart, setTicketCart } = useTicketCart();
  const [saturdayTicketQuantity, setSaturdayTicketQuantity] = useState(0);
  const [sundayTicketQuantity, setSundayTicketQuantity] = useState(0);
  const [sakeTicketQuantity, setSakeTicketQuantity] = useState(0);
  const [vipTicketQuantity, setVipTicketQuantity] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const router = useRouter();
  const PAGE_WIDTH = Dimensions.get('window').width;

  const onPressBuy = () => {
    const updateTicketCart = (name: string, validDate: string, quantity: number) => {
      const existingTicketIndex = ticketCart.findIndex((ticket) => ticket.name === name && ticket.valid_date === validDate);

      if (existingTicketIndex !== -1) {
        // 既存のチケットを更新
        const updatedCart = [...ticketCart];
        updatedCart[existingTicketIndex].qty += quantity;
        setTicketCart(updatedCart);
      } else {
        // 新しいチケットを追加
        setTicketCart([...ticketCart, { name, valid_date: validDate, qty: quantity, userId: user?.id, category: 'ADMISSION' }]);
      }
    };

    if (saturdayTicketQuantity > 0) {
      updateTicketCart('12/14 Saturday', '12/14', saturdayTicketQuantity);
    }
    if (sundayTicketQuantity > 0) {
      updateTicketCart('12/15 Sunday', '12/15', sundayTicketQuantity);
    }

    if (!user?.id) {
      router.push('/login');
    } else {
      router.push('/order-confirmation');
    }
  };

  const onPressAdd = (index: number) => {
    if (index === 0) {
      setSaturdayTicketQuantity(saturdayTicketQuantity + 1);
    } else if (index === 1) {
      setSundayTicketQuantity(sundayTicketQuantity + 1);
    }
  };

  const onPressRemove = (index: number) => {
    if (index === 0) {
      setSaturdayTicketQuantity(saturdayTicketQuantity > 0 ? saturdayTicketQuantity - 1 : 0);
    } else if (index === 1) {
      setSundayTicketQuantity(sundayTicketQuantity > 0 ? sundayTicketQuantity - 1 : 0);
    }
  };

  const onPressSakeAdd = () => {
    setSakeTicketQuantity(sakeTicketQuantity + 1);
  };

  const onPressSakeRemove = () => {
    setSakeTicketQuantity(sakeTicketQuantity > 0 ? sakeTicketQuantity - 1 : 0);
  };

  const onPressVipAdd = () => {
    setVipTicketQuantity(vipTicketQuantity + 1);
  };

  const onPressVipRemove = () => {
    setVipTicketQuantity(vipTicketQuantity > 0 ? vipTicketQuantity - 1 : 0);
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <ScrollView className='flex' showsVerticalScrollIndicator={false}>
      <View className='flex w-full'>
        <Image
          source={'https://cdn.shopify.com/s/files/1/0663/3209/8735/files/tixx_74d625df-efe0-4faf-bac0-c0b055cbaaf2.jpg?v=1725003897'}
          style={{ width: deviceWidth, height: 'auto', aspectRatio: 1 }}
          contentFit='contain'
          transition={1000}
        />
      </View>
      {/* ADMISSION FEE */}
      <View className='flex px-6'>
        <View className='flex py-4 bg-black'>
          <View className='flex'>
            <Text className='text-white font-bold text-xl'>12/14 SATURDAY</Text>
            <View className='flex-row border border-white rounded-lg p-4 items-center mt-3'>
              <View className='flex-1'>
                <Text className='text-white font-bold text-xl'>ADMISSION FEE</Text>
                <Text className='text-white text-md'>$10 / per ticket</Text>
              </View>
              <View className='flex-row rounded-full w-1/3 h-10 bg-white items-center justify-between px-3'>
                <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(0)}>
                  <Ionicons name='remove' color='black' size={18} />
                </TouchableOpacity>
                <View className='items-center justify-center'>
                  <Text className='text-black text-xl font-bold text-center'>{saturdayTicketQuantity}</Text>
                </View>
                <TouchableOpacity className='items-center justify-center' onPress={() => onPressAdd(0)}>
                  <Ionicons name='add' color='black' size={18} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className='flex mt-8'>
          <Text className='text-white font-bold text-xl'>12/15 SUNDAY</Text>
          <View className='flex-row border border-white rounded-lg p-4 items-center mt-3'>
            <View className='flex-1'>
              <Text className='text-white font-bold text-xl'>ADMISSION FEE</Text>
              <Text className='text-white text-md'>$10 / per ticket</Text>
            </View>
            <View className='flex-row rounded-full w-1/3 h-10 bg-white items-center justify-between px-3'>
              <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(1)}>
                <Ionicons name='remove' color='black' size={18} />
              </TouchableOpacity>
              <View className='items-center justify-center'>
                <Text className='text-black text-xl font-bold text-center'>{sundayTicketQuantity}</Text>
              </View>
              <TouchableOpacity className='items-center justify-center' onPress={() => onPressAdd(1)}>
                <Ionicons name='add' color='black' size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* BUNDLES */}
        <View className={`${saturdayTicketQuantity > 0 || sundayTicketQuantity > 0 ? 'opacity-100' : 'opacity-50'} mt-12`}>
          <View className='flex'>
            <View className='flex-row items-center'>
              <MaterialCommunityIcons name='vector-combine' size={24} color='white' className='mr-3' />
              <Text className='text-white font-bold text-2xl'>Bundles</Text>
            </View>
            <Text className='text-white text-lg mt-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget sapien.</Text>
          </View>
          {/* YOKOCHO TICKET */}
          <View className='flex mt-12'>
            <Text className='text-white font-bold text-2xl'>YOKOCHO TICKET</Text>
            <Text className='text-white text-lg'>Japanese craft beer & sake, shochu</Text>

            <View className='flex-row justify-between gap-3 mt-8'>
              <View className='w-1/2 items-center justify-center'>
                <TouchableOpacity className='w-full' onPress={() => openModal(require('@/assets/images/yokocho_1.jpg'))}>
                  <Image source={require('@/assets/images/yokocho_1.jpg')} contentFit='cover' style={{ width: '100%', height: 200 }} />
                </TouchableOpacity>
                <View className='flex-row rounded-full w-full h-10 bg-white items-center justify-between px-4 mt-4'>
                  <TouchableOpacity className='items-center justify-center' onPress={onPressSakeRemove}>
                    <Ionicons name='remove' color='black' size={18} />
                  </TouchableOpacity>
                  <View className='items-center justify-center'>
                    <Text className='text-black text-xl font-bold text-center'>{sakeTicketQuantity}</Text>
                  </View>
                  <TouchableOpacity className='items-center justify-center' onPress={onPressSakeAdd}>
                    <Ionicons name='add' color='black' size={18} />
                  </TouchableOpacity>
                </View>
              </View>
              <View className='w-1/2 items-center justify-center'>
                <TouchableOpacity className='w-full' onPress={() => openModal(require('@/assets/images/yokocho_2.jpg'))}>
                  <Image source={require('@/assets/images/yokocho_2.jpg')} contentFit='cover' style={{ width: '100%', height: 200 }} />
                </TouchableOpacity>
                <View className='flex-row rounded-full w-full h-10 bg-white items-center justify-between px-4 mt-4'>
                  <TouchableOpacity className='items-center justify-center' onPress={onPressVipRemove}>
                    <Ionicons name='remove' color='black' size={18} />
                  </TouchableOpacity>
                  <View className='items-center justify-center'>
                    <Text className='text-black text-xl font-bold text-center'>{vipTicketQuantity}</Text>
                  </View>
                  <TouchableOpacity className='items-center justify-center' onPress={onPressVipAdd}>
                    <Ionicons name='add' color='black' size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Total section */}
          <View className='flex-row justify-between items-center mt-12 border-b border-white pb-6'>
            <Text className='text-white font-bold text-2xl'>Total</Text>
            <Text className='text-white font-bold text-2xl'>
              ${saturdayTicketQuantity * 10 + sundayTicketQuantity * 10 + sakeTicketQuantity * 10 + vipTicketQuantity * 10}
            </Text>
          </View>

          <TouchableOpacity
            className={`mt-12 bg-red-600 p-4 rounded-md w-full ${
              saturdayTicketQuantity > 0 || sundayTicketQuantity > 0 ? 'opacity-100' : 'opacity-50'
            }`}
            disabled={saturdayTicketQuantity > 0 || sundayTicketQuantity > 0 ? false : true}
            onPress={onPressBuy}>
            <Text className='text-white text-center text-xl font-bold'>Buy now</Text>
          </TouchableOpacity>
          <View className='h-12' />
        </View>
      </View>
      <Modal animationType='fade' transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className='flex-1 bg-black bg-opacity-90 justify-center items-center'>
            <Image source={selectedImage} contentFit='contain' style={{ width: '100%', height: '100%' }} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}
