import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export const HeaderRight: React.FC = () => {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View className='flex-row'>
      <TouchableOpacity className='p-2 rounded-full bg-black/20 mr-2' onPress={() => router.push('/notifications')}>
        <Ionicons name='notifications-outline' size={24} color={colors.headerText} />
      </TouchableOpacity>
      <TouchableOpacity className='relative p-2 rounded-full bg-black/20' onPress={() => router.push('/order-history')}>
        <Ionicons name='receipt-outline' size={22} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );
};
