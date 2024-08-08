import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFoodCart } from '@/context/CartContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Text, TouchableOpacity, View, ScrollView, Image, Pressable } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { VendorCarousel } from '@/components/VendorCarousel';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';
import ReadMore from '@fawazahmed/react-native-read-more';
import Ionicons from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';

type Vendor = Database['public']['Tables']['vendors']['Row'];

type Menu = Database['public']['Tables']['menus']['Row'] & { quantity: number };

const times = [
  { time: '11:00', handle: '1100' },
  { time: '11:30', handle: '1130' },
  { time: '12:00', handle: '1200' },
  { time: '12:30', handle: '1230' },
  { time: '13:00', handle: '1300' },
  { time: '13:30', handle: '1330' },
  { time: '14:00', handle: '1400' },
  { time: '14:30', handle: '1430' },
  { time: '15:00', handle: '1500' },
  { time: '15:30', handle: '1530' },
  { time: '16:00', handle: '1600' },
  { time: '16:30', handle: '1630' },
  { time: '17:00', handle: '1700' },
  { time: '17:30', handle: '1730' },
  { time: '18:00', handle: '1800' },
  { time: '18:30', handle: '1830' },
  { time: '19:00', handle: '1900' },
  { time: '19:30', handle: '1930' },
  { time: '20:00', handle: '2000' },
];

export default function FoodVendorPage() {
  const router = useRouter();
  const { foodCart, setFoodCart } = useFoodCart();
  const { user } = useAuth();
  const { vendor } = useLocalSearchParams();

  const [showPayment, setShowPayment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('1100');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const vendorData: Vendor = JSON.parse(vendor as string);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => [1, '95%'], []);

  const images = vendorData?.images ?? [];

  const PAGE_WIDTH = Dimensions.get('window').width;

  useEffect(() => {
    const fetchVendor = async () => {
      const { data, error } = await supabase.from('menus').select('*').eq('vendor', vendorData.id);
      if (error) {
        console.log(error);
      } else {
        let quantityAddedData = data.map((menu) => ({
          ...menu,
          quantity: 0,
        }));
        setMenus(quantityAddedData);
      }
    };
    fetchVendor();
  }, []);

  const onPressMenu = (menu: Menu) => {
    setMenu(menu);
    handlePresentModalPress();
  };

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const onPressTime = (time: string) => {
    setSelectedTime(time);
  };

  const onPressAdd = (menu: Menu, index: number) => {
    setMenus((prevMenus) => {
      const newMenus = [...prevMenus];
      newMenus[index].quantity = newMenus[index].quantity + 1;
      return newMenus;
    });
    if (foodCart.find((item) => item.id === menu.id)) {
      setFoodCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((item) => item.id === menu.id);
        if (existingItemIndex !== -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = { ...updatedCart[existingItemIndex], quantity: updatedCart[existingItemIndex].quantity + 1 };
          return updatedCart;
        } else {
          return [...prevCart, { ...menu, quantity: 1 }];
        }
      });
    } else {
      setFoodCart([...foodCart, { ...menu, quantity: 1 }]);
    }
  };

  const onPressRemove = (menu: Menu, index: number) => {
    setMenus((prevMenus) => {
      const newMenus = [...prevMenus];
      newMenus[index].quantity = 0;
      return newMenus;
    });
    setFoodCart((prevCart) => prevCart.filter((item) => item.id !== menu.id));
  };

  const onPressCheckout = () => {
    if (!user) {
      router.push('/login');
    } else {
      setShowPayment(true);
    }
  };

  return (
    <BottomSheetModalProvider>
      <ScrollView className='flex'>
        <View className='flex flex-col gap-6'>
          <View className='w-full'>
            <VendorCarousel images={images} />
          </View>
          <View className='flex px-4 gap-4'>
            <Text className='text-white text-2xl font-bold'>{vendorData?.name}</Text>
            <ReadMore numberOfLines={3} style={{ color: 'white' }}>
              {vendorData?.descriptions}
            </ReadMore>
          </View>
          <View className='flex flex-col px-4'>
            <Text className='text-white text-2xl font-bold'>Pickup Date</Text>
            <View className='flex-row w-full my-6 gap-4'>
              <SegmentedControl
                values={['12/14', '12/15']}
                selectedIndex={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.nativeEvent.selectedSegmentIndex);
                }}
                tintColor='red'
                style={{ width: 200, height: 40 }}
                fontStyle={{ fontSize: 18, fontWeight: 'bold' }}
                activeFontStyle={{ fontSize: 18, fontWeight: '800' }}
              />
            </View>
            <Text className='text-white text-2xl font-bold'>Pickup Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex my-6'>
              <View className='flex flex-row gap-4'>
                {times.map((time) => (
                  <TouchableOpacity
                    key={time.handle}
                    className={`flex justify-center items-center ${
                      time.handle === selectedTime ? 'bg-red-600' : 'bg-slate-900'
                    } py-2 px-4 rounded-md`}
                    onPress={() => onPressTime(time.handle)}>
                    <Text className='text-white text-xl font-bold'>{time.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          <View className='flex flex-col px-4'>
            <Text className='text-white text-2xl font-bold'>Menus</Text>

            {menus.length > 0 &&
              menus.map((menu, index) => (
                <Pressable key={menu.id} className='flex flex-row justify-between items-center' onPress={() => onPressMenu(menu)}>
                  <View className='flex gap-1 mr-4'>
                    <Text className='text-white text-2xl font-semibold'>{menu.name}</Text>
                    <Text className='text-white text-xl'>${parseFloat(menu.price.toFixed(2))}</Text>
                    <Text className='text-white text-xl'>{menu.descriptions}</Text>
                  </View>
                  <View className='w-1/3 relative'>
                    <Image source={{ uri: menu.images[0].uri }} className='w-full h-40 rounded-md' />
                    {menu.quantity === 0 ? (
                      <TouchableOpacity
                        className='absolute bottom-1 right-0 w-10 h-10 bg-white rounded-full items-center justify-center'
                        onPress={() => onPressAdd(menu, index)}>
                        <Ionicons name='add' color='black' size={24} />
                      </TouchableOpacity>
                    ) : (
                      <View className='flex-row absolute bottom-1 right-0 rounded-full w-3/4 h-10 bg-white items-center justify-between px-3'>
                        <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(menu, index)}>
                          <Ionicons name='trash-bin' color='black' size={18} />
                        </TouchableOpacity>
                        <View className='items-center justify-center'>
                          <Text className='text-black text-xl font-bold text-center'>{menu.quantity}</Text>
                        </View>
                        <TouchableOpacity className='items-center justify-center' onPress={() => onPressAdd(menu, index)}>
                          <Ionicons name='add' color='black' size={18} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
          </View>
          <View className='flex p-10 justify-center items-center'>
            <TouchableOpacity
              className={`${foodCart.length > 0 ? 'bg-red-600 animate-fade-in' : 'hidden'} p-4 rounded-md w-full`}
              disabled={foodCart.length === 0}
              onPress={onPressCheckout}>
              <Text className='text-white text-center text-xl font-bold'>Checkout</Text>
            </TouchableOpacity>
          </View>

          <BottomSheetModal ref={bottomSheetModalRef} index={1} snapPoints={snapPoints} onChange={handleSheetChanges}>
            <BottomSheetScrollView className='flex'>
              <View className='flex flex-col gap-4'></View>
            </BottomSheetScrollView>
          </BottomSheetModal>
        </View>
      </ScrollView>
    </BottomSheetModalProvider>
  );
}
