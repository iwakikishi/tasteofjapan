import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export const HeaderTitle: React.FC<{ title: string }> = ({ title }) => {
  const { colors } = useTheme();

  return (
    <Text className='text-lg font-NotoSansBold' style={{ color: colors.headerText }}>
      {title}
    </Text>
  );
};
