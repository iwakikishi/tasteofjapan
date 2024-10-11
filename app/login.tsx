// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import { HelloWave } from '@/components/HelloWave';
import GoogleButton from '@/components/GoogleButton';
import Checkbox from 'expo-checkbox';
import { useCreateUser } from '@/functions/user-create';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { user, setUser } = useAuth() as { user: any; setUser: (user: any) => void };
  const router = useRouter();
  const { colors } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMarketingAccepted, setIsMarketingAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { createUser } = useCreateUser();

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        router.back();
      }
    }, [user])
  );

  const handleSignUp = async () => {
    setIsLoading(true);
    if (!email || password !== confirmPassword) {
      setIsLoading(false);
      Alert.alert('Error', 'Please enter your email address and ensure passwords match.');
      return;
    }

    try {
      const { shopifyCustomer, supabaseUserId } = await createUser({
        email,
        password,
        acceptsMarketing: isMarketingAccepted,
      });

      if (shopifyCustomer && supabaseUserId) {
        setUser({
          ...user,
          id: supabaseUserId,
          email: email,
          shopifyCustomerId: shopifyCustomer.id,
        });
        router.push('/register');
        setIsLoading(false);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error';
      setIsLoading(false);
      Alert.alert('Error', errorMessage);
    }
  };

  const login = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false,
      },
    });
    if (error) {
      setIsLoading(false);
      Alert.alert('Error', `\n${error.message}\nPlease check your email and password.`);
      return;
    }
    router.push({ pathname: '/verification', params: { email } });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center -mt-20' style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size='large' color={'white'} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View className='flex-1 p-6' style={{ backgroundColor: colors.background }}>
        <View className='flex-row items-center mt-12'>
          <Text className='text-white text-3xl font-bold mr-4'>{isSignUp ? 'Hi there' : 'Log in'}</Text>
          <HelloWave />
        </View>
        <View className='flex mt-6'>
          <Text className='text-white text-lg font-semibold'>
            {isSignUp
              ? 'Please enter your email and password to create your account'
              : 'Please enter your email. We will send you a verification code to your email.'}
          </Text>
        </View>
        <View className='flex-row items-center mt-6'>
          <Text className='text-white text-md'>
            {isSignUp ? 'If you already have an account, please sign in ' : 'If you do not have an account, please sign up '}{' '}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text className='text-red-500 font-semibold text-2xl'>here</Text>
          </TouchableOpacity>
        </View>

        <View className='flex mt-8'>
          <View className='flex'>
            <Text className='text-white text-sm font-semibold'>Email</Text>
            <TextInput
              className='w-full h-[48px] border border-white rounded-lg px-4 pb-1 text-xl text-white mt-2'
              placeholder='xxx@your-email.com'
              keyboardType='email-address'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
            />
          </View>
          {isSignUp && (
            <>
              <View className='flex mt-8'>
                <Text className='text-white text-sm font-semibold'>Password</Text>
                <TextInput
                  className='w-full h-[48px] border border-white rounded-lg px-4 py-2 text-white mt-2'
                  placeholder='Password'
                  keyboardType='default'
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -12 }] }}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color='white' style={{ top: 12 }} />
                </TouchableOpacity>
              </View>
              <View className='flex mt-8'>
                <Text className='text-white text-sm font-semibold'>Confirm Password</Text>
                <TextInput
                  className='w-full h-[48px] border border-white rounded-lg px-4 py-2 text-white mt-2'
                  placeholder='Password'
                  keyboardType='default'
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -12 }] }}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color='white' style={{ top: 12 }} />
                </TouchableOpacity>
              </View>
              <View className='flex-row items-center justify-center mt-6 px-4'>
                <Checkbox value={isMarketingAccepted} onValueChange={setIsMarketingAccepted} className='mr-4' />
                <Text className='text-white text-sm font-semibold'>Keep me updated with Taste of Japan's latest news and exclusive offers</Text>
              </View>
            </>
          )}

          <TouchableOpacity
            className={`bg-white rounded-lg py-2 px-4 mt-8 self-start ${!email ? 'opacity-50' : ''}`}
            onPress={isSignUp ? handleSignUp : login}>
            <Text className='text-black text-lg font-bold'>{isSignUp ? 'Sign up' : 'Log in'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
