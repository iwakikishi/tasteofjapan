import React, { useState, useRef } from 'react';
import Carousel, { TAnimationStyle, CarouselRef } from 'react-native-reanimated-carousel';
import { View, Image, Dimensions, ImageSourcePropType, TouchableHighlight, TouchableOpacity } from 'react-native';
import { interpolate } from 'react-native-reanimated';

interface ImageItem {
  uri?: string;
  url?: string;
  path?: ImageSourcePropType;
}

interface SimpleCarouselProps {
  images: ImageItem[];
  height: number;
  autoPlay: boolean;
}

export const SimpleCarousel = ({ images, height, autoPlay }: SimpleCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef<CarouselRef>(null);

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
    <View className='flex relative'>
      <Carousel
        ref={carouselRef}
        loop={true}
        autoPlay={autoPlay}
        width={PAGE_WIDTH}
        height={height}
        data={images}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => {
          return (
            <View className='bg-white w-full justify-center items-center'>
              <Image source={item} className='w-full h-full' resizeMode='cover' />
            </View>
          );
        }}
        // customAnimation={animationStyle}
        scrollAnimationDuration={1200}
      />
      <View className='flex-row absolute bottom-2 right-1 p-3 bg-black/20 rounded-full justify-center items-center'>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            className={`${index === currentIndex ? 'w-2 h-2 bg-white' : 'w-2 h-2 bg-gray-400'} rounded-full mx-1`}
            onPress={() => {
              setCurrentIndex(index);
              carouselRef.current?.scrollTo({ index });
            }}
          />
        ))}
      </View>
    </View>
  );
};
