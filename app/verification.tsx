import { View, Text, SafeAreaView, Alert, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { OtpInput } from 'react-native-otp-entry';
import { supabase } from '@/lib/supabase-client';

const deviceWidth = Dimensions.get('window').width;

export default function VerificationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setUser } = useAuth();
  const { tempCart } = useCart();
  const { email } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleFilledOtp = async (text: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: text,
        type: 'email',
      });

      if (error) throw new Error(error.message);

      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('id,first_name,last_name,device_token,shopify_customer_id,points,is_admin,has_received_signup_bonus')
        .eq('user_id', data.user?.id)
        .single();

      if (userProfileError) throw new Error(userProfileError.message);

      let updatedPoints = userProfile.points;

      if (!userProfile.has_received_signup_bonus) {
        updatedPoints += 3000;
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            has_received_signup_bonus: true,
            points: updatedPoints,
          })
          .eq('id', userProfile.id);

        if (updateError) throw new Error(updateError.message);
      }

      interface Ticket {
        id: string;
        valid_date: string;
      }

      const checkIfUserHasTickets = async (userProfileId: string) => {
        const { data, error } = await supabase
          .from('tickets')
          .select('id,valid_date')
          .eq('user_id', userProfileId)
          .eq('category', 'ADMISSION TICKETS');
        if (error) {
          console.error('Error fetching user tickets:', error);
          return false;
        }
        if (data.length > 0) {
          console.log('User has tickets:', true);
          const validDates: string[] = Array.from(new Set(data.map((ticket: Ticket) => ticket.valid_date)));
          return {
            hasTickets: true,
            valid_dates: validDates,
          };
        }
        console.log('User has tickets:', false);
        return false;
      };

      const ticketStatus: { hasTickets: boolean; valid_dates: string[] } | false = await checkIfUserHasTickets(userProfile?.id ?? '');

      setUser({
        id: userProfile.id,
        email: data.user?.email,
        phone: data.user?.phone || '',
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        deviceToken: userProfile.device_token || '',
        shopifyCustomerId: userProfile.shopify_customer_id || '',
        points: updatedPoints,
        isAdmin: userProfile.is_admin || false,
        hasTickets: ticketStatus && 'hasTickets' in ticketStatus ? ticketStatus.hasTickets : false,
        ticketDates: ticketStatus && 'valid_dates' in ticketStatus ? ticketStatus.valid_dates : [],
      });
      if (tempCart?.lineItems?.length > 0) {
        router.back();
      } else {
        router.replace('/(tabs)/(tab5)');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsError(false);
    const { error } = await supabase.auth.signInWithOtp({
      email: email as string,
    });
    if (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center' style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size='large' color={'white'} />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 items-center justify-center' style={{ backgroundColor: colors.background }}>
      <View className='flex-1 px-8 items-center justify-center'>
        <View className='flex-1 items-center justify-center -mt-20'>
          <Text className='text-center text-2xl font-NotoSansBold mb-7' style={{ color: colors.headerText }}>
            Enter the code we sent to {'\n'} {email}
          </Text>

          <OtpInput
            numberOfDigits={6}
            focusColor='green'
            focusStickBlinkingDuration={500}
            // onTextChange={(text) => console.log(text)}
            onFilled={(text) => handleFilledOtp(text)}
            textInputProps={{
              accessibilityLabel: 'One-Time Password',
            }}
            theme={{
              containerStyle: {
                backgroundColor: colors.background,
              },
              pinCodeContainerStyle: {
                backgroundColor: colors.background,
                width: deviceWidth / 6 - 15,
                borderRadius: 5,
              },
              pinCodeTextStyle: {
                color: colors.headerText,
                fontSize: 30,
              },
              focusStickStyle: {
                backgroundColor: colors.headerText,
              },
              focusedPinCodeContainerStyle: {
                backgroundColor: colors.background,
                borderColor: 'red',
              },
            }}
          />
          {isError ? (
            <View className='flex-col items-center justify-center'>
              <Text className='text-red-500 text-md mt-4'>Invalid code. Please try again.</Text>
              <TouchableOpacity onPress={resendCode}>
                <Text className='text-red-500 font-NotoSansBold text-md mt-4'>Resend code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className='text-center text-white text-md font-NotoSandsItalic mt-7'>
                If you didn't receive the code, please check your email or spam folder.
              </Text>
              <TouchableOpacity onPress={resendCode}>
                <Text className='text-white font-NotoSansBold text-md mt-4'>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
