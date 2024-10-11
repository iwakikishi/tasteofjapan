import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';

export default function TitleComponent({ title, category }: { title: string; category: string }) {
  const router = useRouter();

  const onViewAll = () => {
    router.push({
      pathname: '/(tabs)/(tab1)/preorder-items-list',
      params: {
        category: category === 'Food' ? 'Food' : 'Retail',
      },
    });
  };

  return (
    <View className='flex-row justify-between items-center px-4'>
      <Text className='text-white text-3xl font-NotoSansBold'>{title}</Text>
      {category !== 'Rewards' && (
        <TouchableOpacity onPress={onViewAll} className='text-white text-sm'>
          <Text className='text-white text-md font-semibold'>View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
