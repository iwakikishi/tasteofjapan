import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import React from 'react';

export default function ProfileScreen() {
  return (
    <SafeAreaView className='flex'>
      <ScrollView className='flex'>
        <View className='flex'>
          <Text className='text-white'>T</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
