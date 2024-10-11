import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
interface Notification {
  id: number;
  message: string;
  created_at: string;
  // Add other necessary fields
}

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity className='mb-4 p-4 bg-white rounded-lg shadow-md'>
      <Text className='text-gray-800 text-base mb-2'>{item.message}</Text>
      <View className='flex-row items-center'>
        <Ionicons name='time-outline' size={16} color='#9CA3AF' />
        <Text className='text-gray-500 text-xs ml-1'>
          {new Date(item.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className='flex-1 bg-gray-100' style={{ backgroundColor: colors.background }}>
      <FlatList
        className='px-4 pt-4'
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />}
        ListEmptyComponent={
          <View className='flex-1 justify-center items-center py-20'>
            <Ionicons name='notifications-off-outline' size={48} color='#9CA3AF' />
            <Text className='text-gray-500 mt-4'>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsScreen;
