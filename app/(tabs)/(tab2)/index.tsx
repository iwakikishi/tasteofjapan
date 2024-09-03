import { SafeAreaView, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

type Order = {
  created_at: string;
  id: string;
  orders: any[];
  pickup_date: string;
  pickup_time: string;
  user_id: string;
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      console.log(user?.id);
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', user?.id).order('pickup_date', { ascending: true });
      if (error) {
        console.log(error);
      } else {
        console.log(data);
        setOrders(data);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <SafeAreaView className='flex-1'>
      <ScrollView className='flex'>
        <View className='flex p-4'>
          <Text className='text-3xl font-bold text-white'>Orders</Text>
          {isLoading ? (
            <View className='flex-1 justify-center items-center h-full'>
              <ActivityIndicator size='large' color='#ffffff' />
            </View>
          ) : orders.length === 0 ? (
            <Text className='text-white text-lg mt-5'>オーダーがありません</Text>
          ) : (
            orders.map((item) => (
              <View key={item.id} className='bg-gray-800 rounded-lg p-4 mt-5 shadow-md'>
                <View className='flex flex-row justify-between items-center mb-2'>
                  <Text className='text-lg font-semibold text-white'>Order #{item.id.slice(-4)}</Text>
                  <Text className='text-sm text-gray-400'>
                    {formatInTimeZone(parseISO(item.created_at), 'America/Los_Angeles', 'MMM d, yyyy h:mm a')}
                  </Text>
                </View>
                <View className='flex flex-row justify-between mb-4'>
                  <Text className='text-white'>Pickup Time:</Text>
                  <Text className='text-white font-medium'>
                    {formatInTimeZone(parseISO(`${item.pickup_date}T${item.pickup_time.split('+')[0]}`), 'America/Los_Angeles', 'MMM d, yyyy h:mm a')}
                  </Text>
                </View>
                <View className='border-t border-gray-700 pt-4'>
                  {item.orders.map((order, index) => (
                    <View key={index} className='flex flex-row items-center mb-4'>
                      <Image source={{ uri: order.image_uri }} style={{ width: 60, height: 60 }} className='rounded-md mr-4' />
                      <View className='flex-1 ml-4'>
                        <Text className='text-white font-semibold'>{order.menu_name}</Text>
                        <Text className='text-gray-400'>{order.vendor_name}</Text>
                        <View className='flex flex-row justify-between mt-1'>
                          <Text className='text-white'>Quantity: {order.quantities}</Text>
                          <Text className='text-white'>{order.status}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
