// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase-client';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { HelloWave } from '@/components/HelloWave';
import GoogleButton from '@/components/GoogleButton';

const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  title: { textAlign: 'center', fontSize: 30 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: deviceWidth / 6 - 12,
    height: deviceWidth / 6 - 12,
    lineHeight: deviceWidth / 6 - 18,
    fontSize: 30,
    borderWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  focusCell: {
    borderColor: 'red',
  },
});

export default function LoginScreen() {
  const [value, setValue] = useState('');
  const CELL_COUNT = 6;
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const [phoneNumber, setPhoneNumber] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const signUp = async () => {
    if (!email) {
      Alert.alert('エラー', 'メールアドレスを入力してください。');
      return;
    }
    const redirectUri = AuthSession.makeRedirectUri({
      path: '/login-callback',
    });
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: redirectUri,
      },
    });
    if (error) {
      Alert.alert('エラー', error.message);
    } else {
      Alert.alert('成功', 'メールを確認してください。認証リンクを送信しました。');
    }
  };

  return (
    <View className='flex p-4'>
      <View className='flex-row items-center mt-12'>
        <Text className='text-white text-3xl font-bold mr-4'>Welcome back</Text>
        <HelloWave />
      </View>
      <View className='flex mt-6'>
        <Text className='text-white text-lg font-semibold'>Please enter the verification code sent to your email</Text>
      </View>
      <View className='flex'>
        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={styles.codeFieldRoot}
          keyboardType='number-pad'
          textContentType='oneTimeCode'
          autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
          testID='my-code-input'
          renderCell={({ index, symbol, isFocused }) => (
            <Text key={index} style={[styles.cell, isFocused && styles.focusCell]} onLayout={getCellOnLayoutHandler(index)}>
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        />
        <TouchableOpacity
          className={`bg-white rounded-lg py-2 px-4 mt-8 self-start ${!email ? 'opacity-50' : ''}`}
          disabled={!email || !password || !confirmPassword}
          onPress={signUp}>
          <Text className='text-black text-lg font-bold'>Sign up</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity className='bg-white rounded-lg py-2 px-4 mt-8 self-start' onPress={sendVerificationCode}>
          <Text className='text-black text-lg'>Send Verification Code</Text>
        </TouchableOpacity> */}
        {/* <GoogleButton /> */}
      </View>
    </View>
  );
}
