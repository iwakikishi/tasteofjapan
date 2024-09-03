import { useEffect, type PropsWithChildren, type ReactElement } from 'react';
import { Dimensions, StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  withSpring,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const deviceWidth = Dimensions.get('window').width;

const HEADER_HEIGHT = deviceWidth * 1.546;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const initialScale = useSharedValue(0);

  useEffect(() => {
    initialScale.value = withTiming(
      1.2,
      {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      },
      () => {
        initialScale.value = withTiming(1, {
          duration: 300,
          easing: Easing.inOut(Easing.cubic),
        });
      }
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const scrollScale = interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]);

    return {
      transform: [
        {
          translateY: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]),
        },
        {
          scale: withSpring(scrollScale * initialScale.value, {
            mass: 1,
            stiffness: 100,
            damping: 10,
            overshootClamping: false,
          }),
        },
      ],
    };
  });

  return (
    <View className='flex bg-black'>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <Animated.View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }, headerAnimatedStyle]}>
          {headerImage}
        </Animated.View>
        <View className='flex'>{children}</View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: deviceWidth * 1.56,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 12,
    gap: 16,
    overflow: 'hidden',
  },
});
