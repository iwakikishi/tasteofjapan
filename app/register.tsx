// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTicketCart } from '@/context/CartContext';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { HelloWave } from '@/components/HelloWave';
import GoogleButton from '@/components/GoogleButton';
import { Picker } from '@react-native-picker/picker';
import SelectDropdown from 'react-native-select-dropdown';

const countryLabels = ['🇺🇸 +1', '🇯🇵 +81', '🇬🇧 +44'];

const countryOptions = ['🇺🇸 +1', '🇯🇵 +81', '🇬🇧 +44'];
const raceEthnicityOptions = [
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'White',
  'Native American',
  'Pacific Islander',
  'Other',
  'Prefer not to say',
];
const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    width: 100,
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
});

export default function RegisterScreen() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { ticketCart, setTicketCart } = useTicketCart();
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [raceEthnicity, setRaceEthnicity] = useState('');
  const [gender, setGender] = useState('');
  const [zipCode, setZipCode] = useState('');

  const registerForPushNotifications = async () => {
    if (!Constants.isDevice) {
      Alert.alert('通知エラー', 'プッシュ通知には実機が必要です');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('通知エラー', 'プッシュ通知の許可が得られませんでした');
        return null;
      }
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      return token;
    } catch (error) {
      console.error('プッシュ通知の設定エラー:', error);
      Alert.alert('エラー', 'プッシュ通知の設定中にエラーが発生しました');
      return null;
    }
  };

  const handleSignUp = async () => {
    let token = null;
    if (__DEV__ === false) {
      token = await registerForPushNotifications();
    }
    if (token) {
      await createUserProfile(token.data);
    } else {
      await createUserProfile(null);
    }
  };

  const createUserProfile = async (token: string | null) => {
    const userId = user?.id;
    if (!userId) {
      Alert.alert('エラー', 'ユーザーIDが取得できませんでした');
      return;
    }
    try {
      const { error: updateError } = await supabase.auth.updateUser({ phone: String(countryCode + phoneNumber) });
      if (updateError) throw new Error(updateError.message);

      const { data, error: insertError } = await supabase
        .from('user_profile')
        .insert({
          first_name: firstName,
          last_name: lastName,
          race: raceEthnicity,
          gender: gender,
          zip_code: zipCode,
          user_id: userId,
          device_token: token,
        })
        .select();
      if (insertError) throw new Error(insertError.message);

      // ユーザー情報の更新
      setUser({
        ...user,
        firstName: data[0].first_name,
        lastName: data[0].last_name,
        deviceToken: token,
      });

      // 画面遷移
      router.push(ticketCart.length > 0 ? '/order-confirmation' : '/account');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      Alert.alert('エラー', errorMessage);
    }
  };

  return (
    <ScrollView className='flex p-4'>
      <View className='flex-row items-center mt-12'>
        <Text className='text-white text-3xl font-bold mr-4'>Hi there</Text>
        <HelloWave />
      </View>
      <View className='flex mt-6'>
        <Text className='text-white text-lg font-semibold'>Please help us improve our event by providing your information.</Text>
      </View>
      <View className='flex mt-8 gap-6'>
        <View className='flex'>
          <Text className='text-white text-sm font-semibold'>Phone Number</Text>
          <View className='flex-row border border-white rounded-lg mt-2'>
            <SelectDropdown
              data={countryOptions}
              onSelect={(selectedItem) => {
                setCountryCode(selectedItem.slice(selectedItem.indexOf('+')));
              }}
              defaultValueByIndex={0}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.dropdownButtonTxtStyle}>{selectedItem}</Text>
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />

            <TextInput
              className='flex-1 h-[48px] text-white ml-2'
              placeholder='Enter your phone number'
              keyboardType='phone-pad'
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>
        <View className='flex'>
          <Text className='text-white text-sm font-semibold'>First Name</Text>
          <TextInput
            className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
            placeholder='First Name'
            keyboardType='default'
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View className='flex'>
          <Text className='text-white text-sm font-semibold'>Last Name</Text>
          <TextInput
            className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
            placeholder='Last Name'
            keyboardType='default'
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <View className='flex'>
          <Text className='text-white text-sm font-semibold'>Race / Ethnicity</Text>
          <View className='border border-white rounded-lg mt-2 overflow-hidden'>
            <SelectDropdown
              data={raceEthnicityOptions}
              onSelect={(selectedItem, index) => {
                setRaceEthnicity(selectedItem);
              }}
              defaultButtonText='Select Race / Ethnicity'
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View style={[styles.dropdownButtonStyle, { width: '100%' }]}>
                    <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Select Race / Ethnicity'}</Text>
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
        </View>
        <View className='flex'>
          <Text className='text-white text-sm font-semibold'>Gender</Text>
          <View className='border border-white rounded-lg mt-2 overflow-hidden'>
            <SelectDropdown
              data={genderOptions}
              onSelect={(selectedItem, index) => {
                setGender(selectedItem);
              }}
              defaultButtonText='Select Gender'
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View style={[styles.dropdownButtonStyle, { width: '100%' }]}>
                    <Text style={styles.dropdownButtonTxtStyle}>{selectedItem || 'Select Gender'}</Text>
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
        </View>
        <View className='flex'>
          <Text className='text-white text-sm font-semibold'>ZIP Code</Text>
          <TextInput
            className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
            placeholder='Enter your ZIP code'
            keyboardType='numeric'
            value={zipCode}
            onChangeText={setZipCode}
          />
        </View>
      </View>
      <View className='flex mt-8'>
        <TouchableOpacity className='bg-white rounded-lg py-2 px-4 self-start' onPress={handleSignUp}>
          <Text className='text-black text-lg font-bold'>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <View className='h-40' />
    </ScrollView>
  );
}
