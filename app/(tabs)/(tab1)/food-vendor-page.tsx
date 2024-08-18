import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '@/context/AuthContext';
import { useFoodCart } from '@/context/CartContext';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, ScrollView, Image, Pressable, SafeAreaView } from 'react-native';
import { VendorCarousel } from '@/components/VendorCarousel';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/supabase';
import ReadMore from '@fawazahmed/react-native-read-more';
import Ionicons from '@expo/vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

type Vendor = Database['public']['Tables']['vendors']['Row'];

type Menu = Database['public']['Tables']['menus']['Row'] & {
  quantity: number;
  images: { uri: string; order: number }[];
  price: number;
  currentStock: number;
  vendor: Vendor;
};

type ImageType = { uri: string; order: number };

type StockWindow = {
  [date: string]: {
    [time: string]: number;
  };
};

type InventoryType = {
  [menuId: string]: StockWindow[];
};

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

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('1100');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [inventory, setInventory] = useState<InventoryType>({});

  const vendorData: Vendor = JSON.parse(vendor as string);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => [1, '95%'], []);

  const images = (vendorData?.images as ImageType[]) ?? [];

  useEffect(() => {
    const fetchMenus = async () => {
      const { data, error } = await supabase.from('menus').select(`*, vendor (name)`).eq('vendor', vendorData.id);
      if (error) {
        console.log(error);
      } else {
        let quantityAddedData = data.map((menu) => {
          const cartItem = foodCart.find((item) => item.id === menu.id);
          return {
            ...menu,
            quantity: cartItem ? cartItem.quantity : 0,
            date: cartItem ? cartItem.date : '',
            time: cartItem ? cartItem.time : '',
          };
        });
        setMenus(quantityAddedData);

        const inventoryData: InventoryType = {};
        data.forEach((menu) => {
          if (menu.stock_pre_window) {
            inventoryData[menu.id] = menu.stock_pre_window;
          }
        });
        setInventory(inventoryData);
      }
    };
    fetchMenus();
  }, []);

  useEffect(() => {
    updateMenusWithCurrentStock();
  }, [selectedDate, selectedTime, inventory]);

  const updateMenusWithCurrentStock = useCallback(() => {
    const date = selectedDate === 0 ? '12/14/2024' : '12/15/2024';
    setMenus((prevMenus) =>
      prevMenus.map((menu) => {
        const stockWindow = inventory[menu.id]?.find((sw) => sw[date]);
        const currentStock = stockWindow ? stockWindow[date][selectedTime] : 0;
        return {
          ...menu,
          currentStock,
          date: selectedDate === 0 ? '12/14/2024' : '12/15/2024',
          time: selectedTime,
        };
      })
    );
  }, [selectedDate, selectedTime, inventory]);

  const onPressMenu = useCallback((menu: Menu) => {
    setMenu(menu); // メニューを設定
    bottomSheetModalRef?.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      bottomSheetModalRef?.current?.dismiss();
    }
  }, []);

  const onPressTime = (time: string) => {
    setSelectedTime(time);
  };

  const onPressAddToCart = () => {
    setMenus((prevMenus) => {
      return prevMenus.map((m) =>
        m.id === menu?.id
          ? {
              ...m,
              quantity: m.quantity + 1,
              date: selectedDate === 0 ? '12/14/2024' : '12/15/2024',
              time: selectedTime,
            }
          : m
      );
    });

    setFoodCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === menu?.id && JSON.stringify(item) === JSON.stringify(menu));
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        return [
          ...prevCart,
          {
            id: menu?.id,
            name: menu?.name,
            price: menu?.price,
            quantity: 1,
            date: selectedDate === 0 ? '12/14/2024' : '12/15/2024',
            time: selectedTime,
            images: menu?.images,
            vendor: menu?.vendor,
          },
        ];
      }
    });
    bottomSheetModalRef?.current?.dismiss();
  };

  const onPressAdd = useCallback(
    (menu: Menu, index: number) => {
      const newDate = selectedDate === 0 ? '12/14/2024' : '12/15/2024';
      setMenus((prevMenus) => prevMenus.map((m, i) => (i === index ? { ...m, quantity: m.quantity + 1, date: newDate, time: selectedTime } : m)));
      setFoodCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === menu.id && item.date === newDate && item.time === selectedTime);

        if (existingItem) {
          return prevCart.map((item) => (item === existingItem ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
          return [
            ...prevCart,
            {
              id: menu.id,
              name: menu.name,
              price: menu.price,
              quantity: 1,
              date: newDate,
              time: selectedTime,
              images: menu.images,
              vendor: menu.vendor,
            },
          ];
        }
      });
    },
    [selectedDate, selectedTime]
  );

  const onPressRemove = useCallback(
    (menu: Menu, index: number) => {
      const newDate = selectedDate === 0 ? '12/14/2024' : '12/15/2024';

      setMenus((prevMenus) => prevMenus.map((m, i) => (i === index ? { ...m, quantity: Math.max(m.quantity - 1, 0) } : m)));

      setFoodCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === menu.id && item.date === newDate && item.time === selectedTime);

        if (existingItem) {
          if (existingItem.quantity > 1) {
            return prevCart.map((item) => (item === existingItem ? { ...item, quantity: item.quantity - 1 } : item));
          } else {
            return prevCart.filter((item) => item !== existingItem);
          }
        }
        return prevCart;
      });
    },
    [selectedDate, selectedTime]
  );

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} />, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView className='flex-1 bg-black'>
          <View className='flex bg-black z-10'>
            <TouchableOpacity className='w-full h-12 px-4 justify-center' onPress={() => router.back()}>
              <Ionicons name='arrow-back' color='white' size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView className='flex'>
            <View className='flex flex-col gap-6'>
              <View className='flex'>
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
                    fontStyle={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}
                    activeFontStyle={{ fontSize: 18, fontWeight: '800', color: 'white' }}
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
                      <View className={`flex gap-1 mr-4 ${menu.currentStock === 0 ? 'opacity-50' : ''}`}>
                        <Text className='text-white text-2xl font-semibold'>{menu.name}</Text>
                        <Text className='text-white text-xl'>${parseFloat((menu.price ?? 0).toFixed(2))}</Text>
                        {menu.currentStock > 0 ? (
                          <Text className='text-white text-xl'>
                            Order limit: <Text className='text-white text-xl font-bold'>{menu.currentStock - menu.quantity}</Text>
                          </Text>
                        ) : (
                          <Text className='text-white text-xl'>Sold out</Text>
                        )}
                        <Text className='text-white text-xl'>{menu.descriptions}</Text>
                      </View>
                      <View className='w-1/3 relative'>
                        <Image source={{ uri: menu.images[0].uri }} className='w-full h-40 rounded-md' />
                        {!menu.quantity ? (
                          <TouchableOpacity
                            className='absolute bottom-1 right-0 w-10 h-10 bg-white rounded-full items-center justify-center'
                            onPress={() => onPressAdd(menu, index)}>
                            <Ionicons name='add' color='black' size={24} />
                          </TouchableOpacity>
                        ) : (
                          <View className='flex-row absolute bottom-1 right-0 rounded-full w-3/4 h-10 bg-white items-center justify-between px-3'>
                            <TouchableOpacity className='items-center justify-center' onPress={() => onPressRemove(menu, index)}>
                              <Ionicons name={menu.quantity === 1 ? 'trash-bin' : 'remove'} color='black' size={18} />
                            </TouchableOpacity>
                            <View className='items-center justify-center'>
                              <Text className='text-black text-xl font-bold text-center'>{menu.quantity}</Text>
                            </View>
                            <TouchableOpacity
                              className={`items-center justify-center ${menu.currentStock - menu.quantity === 0 ? 'opacity-50' : ''}`}
                              onPress={() => (menu.currentStock - menu.quantity === 0 ? null : onPressAdd(menu, index))}
                              disabled={menu.currentStock - menu.quantity === 0}>
                              <Ionicons name='add' color='black' size={18} />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ))}
              </View>
              <View className='flex p-4 justify-center items-center'>
                <Link href={user ? '/checkout' : '/login'} asChild>
                  <TouchableOpacity
                    className={`${foodCart.length > 0 ? 'bg-red-600 animate-fade-in' : 'hidden'} p-4 rounded-full w-full`}
                    disabled={foodCart.length === 0}>
                    <Text className='text-white text-center text-xl font-bold'>Checkout</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>

        <BottomSheetModal
          ref={bottomSheetModalRef}
          style={{ flex: 1 }}
          handleComponent={null} // handleStyleの代わりにこれを使用
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}>
          <BottomSheetScrollView className='flex bg-black'>
            <View className='flex min-h-full p-4'>
              <View className='flex'>
                <Image source={{ uri: menu?.images[0].uri }} className='w-full h-80' resizeMode='cover' />
              </View>
              <View className='flex py-4 gap-3'>
                <Text className='text-white text-2xl font-bold'>{menu?.name}</Text>
                <Text className='text-white text-xl'>{menu?.descriptions}</Text>
              </View>
              <View className='flex py-10'>
                <Text className='text-white text-2xl font-bold'>Options</Text>
              </View>
              <TouchableOpacity
                className='flex-row w-full absolute bottom-5 left-4 justify-between items-center py-3 px-6 bg-red-600 rounded-full'
                onPress={onPressAddToCart}>
                <Text className='text-white text-xl font-bold'>Add to Cart</Text>
                <Text className='text-white text-xl font-bold'>${(menu?.price ?? 0).toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
