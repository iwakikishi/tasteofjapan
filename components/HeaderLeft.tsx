import React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export const HeaderLeft: React.FC = () => {
  const { colors } = useTheme();

  const openURL = async (url: string) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`Could not open URL: ${url}`);
    }
  };

  return (
    <View>
      <TouchableOpacity className='p-2 rounded-full bg-black/20' onPress={() => openURL('https://www.instagram.com/tasteofjpn/')}>
        <Ionicons name='logo-instagram' size={24} color={colors.headerText} />
      </TouchableOpacity>
    </View>
  );
};
