import React from 'react';
import Carousel, { TAnimationStyle } from 'react-native-reanimated-carousel';
import { View, Image, Dimensions, ImageSourcePropType } from 'react-native';
import { interpolate } from 'react-native-reanimated';

export const VendorCarousel = ({ images }: { images: { uri?: string; order: number; path?: ImageSourcePropType }[] }) => {
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
      style={{ width: PAGE_WIDTH }}
      width={PAGE_WIDTH}
      height={PAGE_WIDTH * 0.75}
      data={images || []}
      autoPlayInterval={1000}
      autoPlayReverse={true}
      mode='parallax'
      modeConfig={{
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 40,
      }}
      renderItem={({ item }) => {
        return (
          <View className='bg-white w-full justify-center items-center'>
            {item && typeof item === 'object' && 'uri' in item ? (
              <Image source={{ uri: item.uri }} className='w-full h-full' resizeMode='cover' />
            ) : (
              <Image source={item.path} className='w-full h-full' resizeMode='cover' />
            )}
          </View>
        );
      }}
      customAnimation={animationStyle}
      scrollAnimationDuration={1200}
    />
  );
};
