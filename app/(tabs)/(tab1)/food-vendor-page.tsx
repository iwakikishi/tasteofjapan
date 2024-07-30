import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Dimensions, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { VendorCarousel } from '@/components/VendorCarousel';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';
import ReadMore from '@fawazahmed/react-native-read-more';
import Ionicons from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

type Vendor = Database['public']['Tables']['vendors']['Row'];

type Menu = Database['public']['Tables']['menus']['Row'];

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
  const { user } = useAuth();
  const { vendor } = useLocalSearchParams();

  const [showPayment, setShowPayment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(1);
  const [selectedTime, setSelectedTime] = useState('1100');
  const [menus, setMenus] = useState<Menu[]>([]);
  const vendorData: Vendor = JSON.parse(vendor as string);

  const images = vendorData?.images ?? [];

  const PAGE_WIDTH = Dimensions.get('window').width;

  useEffect(() => {
    const fetchVendor = async () => {
      const { data, error } = await supabase.from('menus').select('*').eq('vendor', vendorData.id);
      if (error) {
        console.log(error);
      } else {
        setMenus(data ?? []);
      }
    };
    fetchVendor();
  }, []);

  const onPressBuy = () => {
    console.log(user);
    if (!user) {
      router.push('/login');
    } else {
      setShowPayment(true);
    }
  };

  const onPressDate = (date: number) => {
    setSelectedDate(date);
  };

  const onPressTime = (time: string) => {
    setSelectedTime(time);
  };

  return (
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
              values={['One', 'Two']}
              selectedIndex={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.nativeEvent.selectedSegmentIndex);
              }}
            />
            <TouchableOpacity
              className={`px-4 py-2 rounded-md ${selectedDate === 1 ? 'bg-red-600' : 'bg-slate-900'}`}
              onPress={() => onPressDate(1)}
              activeOpacity={0.7}>
              <Text className={`text-center text-xl font-bold text-white`}>12/14</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 rounded-md ${selectedDate === 2 ? 'bg-red-600' : 'bg-slate-900'}`}
              onPress={() => onPressDate(2)}
              activeOpacity={0.7}>
              <Text className={`text-center text-xl font-bold text-white`}>12/15</Text>
            </TouchableOpacity>
          </View>
          <Text className='text-white text-2xl font-bold'>Pickup Time</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex my-6'>
            <View className='flex flex-row gap-4'>
              {times.map((time) => (
                <TouchableOpacity
                  key={time.handle}
                  className={`flex justify-center items-center ${time.handle === selectedTime ? 'bg-red-600' : 'bg-slate-900'} py-2 px-4 rounded-md`}
                  onPress={() => onPressTime(time.handle)}>
                  <Text className='text-white text-xl font-bold'>{time.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        <View className='flex flex-col px-4'>
          {menus.length > 0 &&
            menus.map((menu) => (
              <View key={menu.id} className='flex flex-row justify-between items-center'>
                <View className='flex gap-1 mr-4'>
                  <Text className='text-white text-2xl font-semibold'>{menu.name}</Text>
                  <Text className='text-white text-xl'>${parseFloat(menu.price.toFixed(2))}</Text>
                  <Text className='text-white text-xl'>{menu.descriptions}</Text>
                </View>
                <View className='w-1/3 relative'>
                  <Image source={{ uri: menu.images[0].uri }} className='w-full h-40 rounded-md' />
                  <TouchableOpacity className='absolute bottom-1 right-1 w-10 h-10 bg-white rounded-full items-center justify-center'>
                    <Ionicons name='add' color='black' size={24} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
        <View className='flex p-10 justify-center items-center'>
          <TouchableOpacity className='bg-red-600 p-4 rounded-md w-full' onPress={onPressBuy}>
            <Text className='text-white text-center text-xl font-bold'>Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
