import React, { useEffect, useState } from 'react';
import Carousel, { TAnimationStyle } from 'react-native-reanimated-carousel';
import { View, Dimensions, ImageSourcePropType, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

interface ImageItem {
  uri?: string;
  url?: string;
  order: number;
  path?: ImageSourcePropType;
  width?: number;
  height?: number;
}

export const VendorCarousel = ({
  images,
}: {
  images: { uri?: string; url?: string; originalSrc?: string; order: number; path?: ImageSourcePropType }[];
}) => {
  const [imageSizes, setImageSizes] = useState<{ width: number; height: number }[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const Pagination = ({ size, activeIndex }) => {
    return (
      <View style={styles.paginationContainer} className='absolute bottom-2 right-4 p-4 rounded-full bg-black/10'>
        {images.map((_, i) => (
          <PaginationItem key={i} isActive={i === activeIndex} index={i} length={size} />
        ))}
      </View>
    );
  };

  const PaginationItem = ({ isActive, index, length }) => {
    const animStyle = useAnimatedStyle(() => {
      const opacity = interpolate(isActive ? 1 : 0, [0, 1], [0.5, 1]);
      const scale = interpolate(isActive ? 1 : 0, [0, 1], [1, 1.25]);

      return {
        opacity,
        transform: [{ scale }],
      };
    });

    return <Animated.View style={[styles.paginationDot, animStyle, isActive && styles.paginationDotActive]} />;
  };

  const handleImageLoad = (event: any, index: number) => {
    const { width, height } = event.source;
    setImageSizes((prev) => {
      const newSizes = [...prev];
      newSizes[index] = { width, height };
      return newSizes;
    });
  };

  useEffect(() => {
    // 初期化時に画像の数だけ空のサイズオブジェクトを作成
    setImageSizes(new Array(images.length).fill({ width: 0, height: 0 }));
  }, [images.length]);

  return (
    <View className='flex relative'>
      <Carousel
        loop={false}
        autoPlay={false}
        style={{ width: PAGE_WIDTH }}
        width={PAGE_WIDTH}
        height={PAGE_WIDTH}
        data={images || []}
        // autoPlayInterval={1000}
        // autoPlayReverse={true}
        onSnapToItem={(index) => setActiveIndex(index)}
        mode='parallax'
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
        }}
        renderItem={({ item, index }) => {
          const imageSize = imageSizes[index];
          const aspectRatio = imageSize?.width ? imageSize.width / imageSize.height : 1;
          return (
            <View className='bg-black w-full justify-center items-center'>
              {item && typeof item === 'object' ? (
                <Image
                  source={{
                    uri:
                      typeof item.uri === 'string'
                        ? item.uri
                        : typeof item.url === 'string'
                        ? item.url
                        : typeof item.path === 'string'
                        ? item.originalSrc
                        : typeof item.originalSrc === 'string'
                        ? item.originalSrc
                        : undefined,
                  }}
                  contentFit='cover'
                  style={{ width: '100%', aspectRatio }}
                  onLoad={(event) => handleImageLoad(event, index)}
                />
              ) : (
                <Text className='text-white'>No Image</Text>
              )}
            </View>
          );
        }}
        customAnimation={animationStyle}
        scrollAnimationDuration={1200}
      />
      {images.length > 1 && <Pagination size={images.length} activeIndex={activeIndex} />}
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'gray',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
  },
});
