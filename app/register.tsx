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
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '@/lib/supabase-client';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { HelloWave } from '@/components/HelloWave';
import { updateUser } from '@/functions/user-update';
import { deleteUser } from '@/functions/user-delete';
import { useActionSheet } from '@expo/react-native-action-sheet';

const countryOptions = ['🇺🇸 +1', '🇯🇵 +81', '🇬🇧 +44'];
const ethnicityOptions = [
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

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { tempCart } = useCart();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  // const [phone, setPhone] = useState('');
  // const [countryCode, setCountryCode] = useState('+1');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ethnicity, setEthnicity] = useState('Prefer not to say');
  const [gender, setGender] = useState('Prefer not to say');
  const [zipCode, setZipCode] = useState('');

  const { showActionSheetWithOptions } = useActionSheet();

  const handleRegistrationError = (errorMessage: string) => {
    alert(errorMessage);
    throw new Error(errorMessage);
  };

  const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const token = await registerForPushNotifications();
      if (!token) {
        console.log('Failed to get push token');
        return;
      }

      console.log('Expo Push Token:', token);

      const result = await updateUser({
        id: user?.shopifyCustomerId ?? '',
        userId: user?.id ?? '',
        firstName,
        lastName,
        phone: '',
        ethnicity,
        gender,
        zipcode: zipCode,
        deviceToken: token,
      });

      if (result.success) {
        const { profile: userData, shopify_customer: shopifyCustomer } = result.data;

        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            id: userData.id,
            phone: shopifyCustomer.phone ?? '',
            firstName: shopifyCustomer.firstName,
            lastName: shopifyCustomer.lastName,
            deviceToken: token ?? '',
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
      } else {
        Alert.alert('Error', 'Signup failed');
      }
    } catch (error) {
      console.error('Error occurred while registering:', error);
      Alert.alert('Error', 'Error occurred while registering');
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteUser = async () => {
    setIsLoading(true);
    try {
      if (!user || !user.id) {
        throw new Error('current user not found');
      }
      await supabase.auth.signOut();
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

  const onPressEthnicity = () => {
    const options = ethnicityOptions;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Please select Ethnicity',
        userInterfaceStyle: 'light',
        tintColor: 'black',
      },
      (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex !== options.length - 1) {
          setEthnicity(options[selectedIndex]);
        }
      }
    );
  };

  const onPressGender = () => {
    const options = genderOptions;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Please select Gender',
        userInterfaceStyle: 'light',
        tintColor: 'black',
      },
      (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex !== options.length - 1) {
          setGender(options[selectedIndex]);
        }
      }
    );
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
        <ScrollView className={`flex p-4`} style={{ backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1 }}>
          <View className='flex-row items-center'>
            <Text className='text-white text-3xl font-bold mr-4'>Hi there</Text>
            <HelloWave />
          </View>
          <View className='flex mt-6'>
            <Text className='text-white text-lg font-semibold'>Please help us improve our event by providing your information.</Text>
          </View>
          <View className='flex mt-8 gap-6'>
            {/* <View className='flex'>
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
            </View> */}
            <View className='flex'>
              <Text className='text-white text-sm font-NotoSansBold'>First Name</Text>
              <TextInput
                className='w-full h-[48px] border border-gray-400 rounded-lg px-4 pb-1.5 text-white mt-2 text-xl'
                placeholder='First Name'
                placeholderTextColor='gray'
                keyboardType='default'
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View className='flex'>
              <Text className='text-white text-sm font-NotoSansBold'>Last Name</Text>
              <TextInput
                className='w-full h-[48px] border border-gray-400 rounded-lg px-4 pb-1.5 text-white mt-2 text-xl'
                placeholder='Last Name'
                placeholderTextColor='gray'
                keyboardType='default'
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            <View className='flex'>
              <Text className='text-white text-sm font-NotoSansBold'>Race / Ethnicity (Optional)</Text>
              <View className='border border-gray-400 h-[48px] rounded-lg mt-2 overflow-hidden justify-center'>
                <TouchableOpacity className='flex-1 px-4 justify-center' onPress={onPressEthnicity}>
                  <Text className='text-white text-lg font-NotoSans'>{ethnicity}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className='flex'>
              <Text className='text-white text-sm font-NotoSansBold'>Gender (Optional)</Text>
              <View className='border border-gray-400 h-[48px] rounded-lg mt-2 overflow-hidden justify-center'>
                <TouchableOpacity className='flex-1 px-4 justify-center' onPress={onPressGender}>
                  <Text className='text-white text-lg font-NotoSans'>{gender}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className='flex'>
              <Text className='text-white text-sm font-NotoSansBold'>ZIP Code (Optional)</Text>
              <TextInput
                className='w-full h-[48px] border border-gray-400 rounded-lg px-4 pb-1.5 text-white mt-2 text-xl'
                placeholder='Enter your ZIP code'
                placeholderTextColor='gray'
                keyboardType='numeric'
                value={zipCode}
                onChangeText={setZipCode}
              />
            </View>
          </View>

          <View className='flex mt-8'>
            <TouchableOpacity className='bg-white rounded-lg py-2 px-4 self-start' onPress={handleRegister}>
              <Text className='text-black text-lg font-NotoSansBold'>Register</Text>
            </TouchableOpacity>
          </View>

          <View className='h-40' />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
