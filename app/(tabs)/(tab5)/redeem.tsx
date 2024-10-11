import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase-client';

export default function RedeemScreen() {
  const { colors } = useTheme();
  const { user, setUser } = useAuth();
  const [points, setPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isOpenAdminPanel, setIsOpenAdminPanel] = useState(false);

  useEffect(() => {
    const fetchPoints = async () => {
      const { data, error } = await supabase.from('user_profiles').select('points').eq('id', user?.id).single();
      if (error) {
        console.error(error);
      } else {
        setPoints(data.points);
      }
    };
    fetchPoints();
  }, [user]);

  const onPressRedeem = () => {
    if (points >= redeemPoints) {
      Alert.alert('Redeem', 'Do you want to redeem ' + redeemPoints + ' points?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    }
  };

  const onPressGaraponLottery = () => {
    if (points >= 3000) {
      Alert.alert('Garapon Lottery', 'Do you want to use 3000 points to participate in the Garapon lottery?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Participate',
          onPress: () => {
            console.log('Participated in Garapon lottery');
            setPoints(points - 3000);
            setUser((prevUser) => (prevUser ? { ...prevUser, points: prevUser.points! - 3000 } : null));
          },
        },
      ]);
      setPoints(points - 3000);
    } else {
      Alert.alert('Almost there!', 'Keep collecting points for amazing rewards! You can do it!');
    }
  };

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <ScrollView className='bg-gray-900'>
        <View className='p-6 space-y-6 gap-4'>
          <View className='bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg'>
            <Text className='text-4xl font-NotoSansBold text-white mb-2'>Redeem Points</Text>
            <Text className='text-base font-NotoSansRegular text-gray-200'>
              Exchange points for exclusive goods or try your luck with Garapon lottery!
            </Text>
          </View>

          <View className='bg-gray-800 rounded-2xl p-6 shadow-lg'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-2xl font-NotoSansRegular text-gray-300'>Available Points</Text>
              <View className='flex-row items-center'>
                <Text className='text-3xl font-NotoSansBold text-white'>{points}</Text>
                <Text className='text-xl text-gray-400'>{'  '}pts</Text>
              </View>
            </View>
          </View>

          <View className='space-y-4 gap-4'>
            <TouchableOpacity className='bg-blue-600 rounded-xl p-4 shadow-md' onPress={() => setIsOpenAdminPanel(!isOpenAdminPanel)}>
              <Text className='text-xl font-NotoSansBold text-white text-center'>Exchange for Goods</Text>
            </TouchableOpacity>
            {isOpenAdminPanel && (
              <View className='bg-gray-800 border-white border-2 border-dotted rounded-2xl p-6 shadow-lg'>
                <Text className='text-xl font-NotoSansBold text-white text-center'>Only for admin</Text>
                <View className='flex-row justify-center items-center mt-4'>
                  <TouchableOpacity
                    className='w-12 h-12 justify-center items-center bg-red-500 rounded-full'
                    onPress={() => {
                      setRedeemPoints((prevPoints) => Math.max(0, prevPoints - 500));
                      setUser((prevUser) => (prevUser ? { ...prevUser, points: Math.max(0, prevUser.points! - 500) } : null));
                    }}>
                    <Text className='text-white font-NotoSansBold text-3xl'>-</Text>
                  </TouchableOpacity>
                  <Text className='text-white font-NotoSansBold text-2xl mx-4'>500 pts</Text>
                  <TouchableOpacity
                    className='w-12 h-12 justify-center items-center bg-green-500 rounded-full'
                    onPress={() => {
                      setRedeemPoints((prevPoints) => prevPoints + 500);
                      setUser((prevUser) => (prevUser ? { ...prevUser, points: prevUser.points! + 500 } : null));
                    }}>
                    <Text className='text-white font-NotoSansBold text-3xl'>+</Text>
                  </TouchableOpacity>
                </View>
                <View className='flex-row justify-center items-center mt-4'>
                  <TouchableOpacity
                    className='w-12 h-12 justify-center items-center bg-red-500 rounded-full'
                    onPress={() => {
                      setRedeemPoints((prevPoints) => Math.max(0, prevPoints - 1000));
                      setUser((prevUser) => (prevUser ? { ...prevUser, points: Math.max(0, prevUser.points! - 1000) } : null));
                    }}>
                    <Text className='text-white font-NotoSansBold text-3xl'>-</Text>
                  </TouchableOpacity>
                  <Text className='text-white font-NotoSansBold text-2xl mx-4'>1000 pts</Text>
                  <TouchableOpacity
                    className='w-12 h-12 justify-center items-center bg-green-500 rounded-full'
                    onPress={() => {
                      setRedeemPoints((prevPoints) => prevPoints + 1000);
                      setUser((prevUser) => (prevUser ? { ...prevUser, points: prevUser.points! + 1000 } : null));
                    }}>
                    <Text className='text-white font-NotoSansBold text-3xl'>+</Text>
                  </TouchableOpacity>
                </View>
                <View className='flex-row justify-center items-center mt-4'>
                  <Text className='text-white font-NotoSansBold text-2xl text-center'>Redeem {redeemPoints} pts</Text>
                </View>
                <View className='flex-row justify-center items-center mt-4'>
                  <TouchableOpacity className='bg-red-600 rounded-xl p-4 shadow-md' onPress={onPressRedeem}>
                    <Text className='text-xl font-NotoSansBold text-white text-center'>Redeem</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <TouchableOpacity className='bg-green-600 rounded-xl p-4 shadow-md' onPress={onPressGaraponLottery}>
              <Text className='text-xl font-NotoSansBold text-white text-center'>Try Garapon Lottery for 3000 points</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
