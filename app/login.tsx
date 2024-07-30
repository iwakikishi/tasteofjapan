// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase-client';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const sendVerificationCode = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Verification code sent!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phone Login</Text>
      <TextInput style={styles.input} placeholder='Enter phone number' keyboardType='phone-pad' value={phoneNumber} onChangeText={setPhoneNumber} />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Send Verification Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '80%',
    marginBottom: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
