// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { HelloWave } from '@/components/HelloWave';
import SelectDropdown from 'react-native-select-dropdown';
import { updateUser } from '@/functions/user-update';
import { deleteUser } from '@/functions/user-delete';

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
  const { colors } = useTheme();
  const { tempCart } = useCart();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ethnicity, setEthnicity] = useState('');
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

  const handleRegister = async () => {
    setIsLoading(true);
    let token = null;
    token = await registerForPushNotifications();

    if (token) {
      token = token.data;
    } else {
      token = '';
    }
    const result = await updateUser({
      id: user?.shopifyCustomerId ?? '',
      userId: user?.id ?? '',
      firstName,
      lastName,
      phone: countryCode + phone,
      ethnicity,
      gender,
      zipcode: zipCode,
      deviceToken: token,
    });

    if (result.success) {
      const userData = result.data.profile;
      console.log('userData', userData, 'id', userData.id);
      const shopifyCustomer = result.data.shopify_customer;

      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          id: userData.id,
          phone: shopifyCustomer.phone ?? '',
          firstName: shopifyCustomer.firstName,
          lastName: shopifyCustomer.lastName,
          deviceToken: userData.device_token ?? '',
          points: 3000,
          isAdmin: false,
          hasTickets: false,
          ticketDates: [],
        };
      });
      if (tempCart?.lineItems?.length > 0) {
        router.back();
      } else {
        router.push('/(tabs)/(tab5)');
      }
      setIsLoading(false);
    } else {
      Alert.alert('Error', 'Signup failed');
      setIsLoading(false);
    }
  };

  const onDeleteUser = async () => {
    setIsLoading(true);
    try {
      if (!user || !user.id) {
        throw new Error('current user not found');
      }
      const result = await deleteUser({ userId: user.id });
      console.log('deleteUser result:', result);

      if (result.success) {
        console.log('Successfully deleted user');
        setUser(null);
        router.back();
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const onPressCancel = () => {
    Alert.alert('Cancel', 'Are you sure you want to cancel registration?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => onDeleteUser() },
    ]);
  };

  if (isLoading) {
    return (
      <View className='flex-1 h-full items-center justify-center bg-black'>
        <ActivityIndicator size='large' color='white' />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1' style={{ backgroundColor: colors.background }}>
      <View className='flex px-4 h-16 justify-between items-end'>
        <TouchableOpacity onPress={onPressCancel}>
          <Text className='text-white text-lg font-semibold'>Cancel</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView className={`flex p-4 h-full`} style={{ backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
          <View className='flex-row items-center'>
            <Text className='text-white text-3xl font-bold mr-4'>Hi there</Text>
            <HelloWave />
          </View>
          <View className='flex mt-6'>
            <Text className='text-white text-lg font-semibold'>Please help us improve our event by providing your information.</Text>
          </View>
          <View className='flex mt-8 gap-6'>
            <View className='flex'>
              <Text className='text-white text-sm font-semibold'>Phone Number</Text>
              <View className='flex-row h-[48px] border border-white rounded-lg mt-2 items-center justify-center'>
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
                  className='flex-1 h-[48px] text-white ml-2 text-xl font-semibold'
                  placeholder='Enter your phone number'
                  keyboardType='phone-pad'
                  value={phone}
                  onChangeText={setPhone}
                  style={{ lineHeight: 21 }}
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
                    setEthnicity(selectedItem);
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
            <TouchableOpacity className='bg-white rounded-lg py-2 px-4 self-start' onPress={handleRegister}>
              <Text className='text-black text-lg font-bold'>Register</Text>
            </TouchableOpacity>
          </View>

          <View className='h-40' />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
