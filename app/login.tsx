// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import { HelloWave } from '@/components/HelloWave';
import GoogleButton from '@/components/GoogleButton';
import { useTicketCart } from '@/context/CartContext';

export default function LoginScreen() {
  const { setUser } = useAuth() as { user: any; setUser: (user: any) => void };
  const { ticketCart } = useTicketCart() as { ticketCart: any };
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const sendVerificationCode = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Verification code sent!');
    }
  };

  const signUp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) {
        throw error;
      } else {
        Alert.alert('Success', 'Please check your email for the verification code.');

        if (data.user) {
          router.push('/register');
        } else {
          Alert.alert('エラー', 'ユーザー情報が取得できませんでした。');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('User already registered')) {
        router.push('/order-confirmation');
      } else {
        Alert.alert('Error', 'Failed to sign up. Please try again later.');
      }
      console.log(error);
    }
  };

  const login = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      if (user) {
        const { data, error } = await supabase.from('user_profile').select('first_name,last_name,device_token').eq('user_id', user.id).single();
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          setUser({
            id: user.id,
            email: user.email,
            phone: user.phone || '',
            firstName: data.first_name,
            lastName: data.last_name,
            deviceToken: data.device_token || '',
          });
          if (cart.length > 0) {
            router.push('/order-confirmation');
          } else {
            router.back();
          }
        }
      }
    }
  };

  return (
    <View className='flex p-4'>
      <View className='flex-row items-center mt-12'>
        <Text className='text-white text-3xl font-bold mr-4'>Hi there</Text>
        <HelloWave />
      </View>
      <View className='flex mt-6'>
        <Text className='text-white text-lg font-semibold'>Please enter your email and password to create your account</Text>
      </View>
      <View className='flex-row items-center mt-6'>
        <Text className='text-white text-md'>If you already have an account, please sign in </Text>
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text className='text-red-500 font-semibold text-lg'>here</Text>
        </TouchableOpacity>
      </View>
      {isSignUp ? (
        <View className='flex mt-8'>
          <View className='flex'>
            <Text className='text-white text-sm font-semibold'>Email</Text>
            <TextInput
              className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
              placeholder='xxx@your-email.com'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View className='flex my-8'>
            <Text className='text-white text-sm font-semibold'>Password</Text>
            <TextInput
              className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
              placeholder='Password'
              keyboardType='default'
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View className='flex'>
            <Text className='text-white text-sm font-semibold'>Confirm Password</Text>
            <TextInput
              className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
              placeholder='Confirm Password'
              keyboardType='default'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <TouchableOpacity
            className={`bg-white rounded-lg py-2 px-4 mt-8 self-start ${!email ? 'opacity-50' : ''}`}
            // disabled={!email}
            onPress={signUp}>
            <Text className='text-black text-lg font-bold'>Send Verification Code</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity className='bg-white rounded-lg py-2 px-4 mt-8 self-start' onPress={sendVerificationCode}>
          <Text className='text-black text-lg'>Send Verification Code</Text>
        </TouchableOpacity> */}
          {/* <GoogleButton /> */}
        </View>
      ) : (
        <View className='flex mt-8'>
          <View className='flex'>
            <Text className='text-white text-sm font-semibold'>Email</Text>
            <TextInput
              className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
              placeholder='xxx@your-email.com'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View className='flex my-8'>
            <Text className='text-white text-sm font-semibold'>Password</Text>
            <TextInput
              className='w-full h-[48px] border border-white rounded-lg p-2 text-white mt-2'
              placeholder='Password'
              keyboardType='default'
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className={`bg-white rounded-lg py-2 px-4 mt-8 self-start ${!email ? 'opacity-50' : ''}`}
            // disabled={!email}
            onPress={login}>
            <Text className='text-black text-lg font-bold'>Log in</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity className='bg-white rounded-lg py-2 px-4 mt-8 self-start' onPress={sendVerificationCode}>
          <Text className='text-black text-lg'>Send Verification Code</Text>
        </TouchableOpacity> */}
          {/* <GoogleButton /> */}
        </View>
      )}
    </View>
  );
}
