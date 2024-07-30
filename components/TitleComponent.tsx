import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import React from 'react';

export default function TitleComponent({ title, category }: { title: string; category: string }) {
  const navigation = useNavigation();

  const onViewAll = () => {
    if (category === 'Food') {
      navigation.navigate('food-preorder-page');
    }
  };

  return (
    <View className='flex-row justify-between items-center mb-5'>
      <Text className='text-white text-2xl font-bold'>{title}</Text>
      <TouchableOpacity onPress={onViewAll} className='text-white text-sm'>
        <Text className='text-white text-md font-semibold'>View all</Text>
      </TouchableOpacity>
    </View>
  );
}
