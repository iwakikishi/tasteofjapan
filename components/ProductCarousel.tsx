import React from 'react';
import Carousel, { TAnimationStyle } from 'react-native-reanimated-carousel';
import { View, Image, Dimensions } from 'react-native';
import { interpolate } from 'react-native-reanimated';

export const ProductCarousel = () => {
  const PAGE_WIDTH = Dimensions.get('window').width;
  const animationStyle: TAnimationStyle = React.useCallback((value: number) => {
    'worklet';

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const translateX = interpolate(value, [-2, 0, 1], [-PAGE_WIDTH, 0, PAGE_WIDTH]);

    return {
      transform: [{ translateX }],
      zIndex,
    };
  }, []);
  return (
    <Carousel
      loop={false}
      autoPlay={false}
      style={{ width: PAGE_WIDTH, height: PAGE_WIDTH * 1.339 }}
      width={PAGE_WIDTH}
      data={[require('@/assets/images/goodie.jpg')]} // ローカルディレクトリの画像を設定
      renderItem={({ item }) => {
        return (
          <View className='bg-white w-full justify-center items-center'>
            <Image source={item} className='w-full h-full' resizeMode='contain' />
          </View>
        );
      }}
      customAnimation={animationStyle}
      scrollAnimationDuration={1200}
    />
  );
};
