import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase-client';

export default function ContactScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // const handleSubmit = async () => {
  //   if (!name || !email || !message) {
  //     Alert.alert('Error', 'Please fill in all fields.');
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     const { data, error } = await supabase.functions.invoke('send-contact-email', {
  //       body: { name, email, message },
  //     });

  //     if (error) throw error;

  //     Alert.alert('Success', 'Message sent successfully.');
  //     setIsSuccess(true);
  //     setName('');
  //     setEmail('');
  //     setMessage('');
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     Alert.alert('Error', 'Failed to send message. Please try again later.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://wtgcaqmwnsdisvxppano.supabase.co/functions/v1/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      Alert.alert('Success', 'Message sent successfully.');
      setIsSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Message sending error:', error);
      Alert.alert('Error', `Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className='flex-1 px-6 items-center justify-center -mt-10'>
        <Text className='text-3xl font-NotoSansBold mb-6 text-white text-left w-full'>Contact us</Text>

        <View className='w-full mb-4'>
          <Text className='text-white mb-2'>Your name</Text>
          <TextInput
            className='bg-white rounded-md p-4 h-12 font-NotoSans'
            value={name}
            onChangeText={setName}
            placeholder='Please enter your name'
          />
        </View>

        <View className='w-full mb-4'>
          <Text className='text-white mb-2'>Email</Text>
          <TextInput
            className='bg-white rounded-md p-4 h-12 font-NotoSans'
            value={email}
            onChangeText={setEmail}
            placeholder='Please enter your email'
            keyboardType='email-address'
            autoCapitalize='none'
          />
        </View>

        <View className='w-full mb-7'>
          <Text className='text-white mb-2'>Message</Text>
          <TextInput
            className='bg-white rounded-md p-4 h-48 font-NotoSans text-lg'
            value={message}
            onChangeText={setMessage}
            placeholder='Please enter your message'
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity className='w-full bg-red-500 rounded-md items-center py-4' onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color='white' /> : <Text className='text-white font-NotoSansBold text-xl'>Send</Text>}
        </TouchableOpacity>
        {isSuccess && <Text className='text-white mt-4'>Message sent successfully. We will get back to you soon.</Text>}
      </View>
    </SafeAreaView>
  );
}
