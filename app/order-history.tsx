import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { View, Text, SafeAreaView, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import { Ionicons } from '@expo/vector-icons';

interface LineItem {
  id: string;
  title: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    product: {
      priceRange: {
        minVariantPrice: {
          amount: string;
        };
      };
      images: {
        edges: {
          node: {
            url: string;
          };
        }[];
      };
    };
  };
}

type Order = {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  lineItems: {
    edges: {
      node: LineItem;
    }[];
  };
};

export default function OrderHistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCustomerOrderHistory = async (customerId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Current session not found');
      }

      const response = await fetch('https://wtgcaqmwnsdisvxppano.supabase.co/functions/v1/get-customer-order-history', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting response:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.shopifyCustomerId) {
        setIsLoading(true);
        try {
          const results = await getCustomerOrderHistory(user.shopifyCustomerId);
          if (results.data.orders.edges) {
            const orders = results.data.orders.edges.map((edge: any) => edge.node);
            setOrders(orders);
          }
        } catch (error) {
          console.error('Error getting order history:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user?.shopifyCustomerId]);

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center p-4 bg-black'>
        <ActivityIndicator size='large' color={'white'} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className='flex-1 items-center justify-center p-4 bg-black'>
        <Text className='text-lg font-NotoSansBold text-white text-center'>No order history.{'\n'}Let's order from your favorite stores!</Text>
      </View>
    );
  }

  const renderOrderItem = ({ item: order }: { item: Order }) => (
    <TouchableOpacity
      className='bg-slate-950 border-b border-gray-800 p-4 rounded-lg'
      onPress={() => {
        /* 注文詳細画面へ遷移 */
      }}>
      <View className='flex-1 gap-3'>
        <View className='flex-row items-center justify-between'>
          <Text className='text-2xl font-NotoSansBold text-white mb-1'>{order.name}</Text>
          <Text className='text-sm text-gray-400 mb-1'>
            {new Date(order.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/Los_Angeles',
            })}{' '}
            PST
          </Text>
        </View>

        {order.lineItems.edges.map(({ node: item }, index: number) => (
          <View key={index} className='flex-1 gap-3'>
            <View className='flex-row items-center justify-between space-y-3'>
              {item?.variant?.product?.images?.edges?.[0]?.node?.url && (
                <Image source={{ uri: item.variant.product.images.edges[0].node.url }} className='w-10 h-10 mr-3 rounded-lg' />
              )}
              <Text className='text-md font-NotoSans text-white flex-1 mr-2' numberOfLines={2} ellipsizeMode='tail'>
                {item?.title || 'Unknown Product'}
              </Text>
              <Text className='text-lg font-NotoSansBold text-white'>x {item?.quantity || 0}</Text>
            </View>
          </View>
        ))}
        <Text className='text-xl font-NotoSansBold text-white mt-2'>${parseFloat(order.totalPriceSet.shopMoney.amount).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <View className='flex-1 p-2 gap-4' style={{ backgroundColor: colors.background }}>
        <Text className='text-3xl font-NotoSansBold text-white p-2'>Orders</Text>
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center p-4'>
              <Text className='text-lg font-NotoSansBold text-white text-center'>No order history.{'\n'}Let's order from your favorite stores!</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
