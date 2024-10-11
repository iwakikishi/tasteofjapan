import { useEffect, type PropsWithChildren, type ReactElement } from 'react';
import { Dimensions, useColorScheme, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  withSpring,
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedScrollHandler,
  Extrapolate,
} from 'react-native-reanimated';
import { HeaderLeft } from './HeaderLeft';
import { useTheme } from '@/context/ThemeContext';
import { HeaderRight } from './HeaderRight';

const deviceWidth = Dimensions.get('window').width;

const HEADER_HEIGHT = deviceWidth * 1.546;
const NORMAL_HEADER_HEIGHT = 38;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children, headerImage, headerBackgroundColor }: Props) {
  const { colors } = useTheme();
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const initialScale = useSharedValue(0);
  const headerOpacity = useSharedValue(0);

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
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
            Extrapolate.CLAMP
          ),
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y;
      headerOpacity.value = interpolate(offsetY, [HEADER_HEIGHT - NORMAL_HEADER_HEIGHT, HEADER_HEIGHT], [0, 1], Extrapolate.CLAMP);
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      position: 'absolute',
      top: 2,
      left: 0,
      right: 0,
      height: NORMAL_HEADER_HEIGHT,
      backgroundColor: 'transparent',
    };
  });

  return (
    <View className='flex-1' style={{ backgroundColor: colors.background }}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16} onScroll={scrollHandler} className='flex-1'>
        <Animated.View
          className='overflow-hidden'
          style={[{ height: HEADER_HEIGHT, backgroundColor: headerBackgroundColor[colorScheme] }, headerAnimatedStyle]}>
          {headerImage}
        </Animated.View>
        <View className='flex-1'>{children}</View>
      </Animated.ScrollView>
      <Animated.View className='flex-row items-center justify-between px-4' style={headerStyle}>
        <HeaderLeft />
        <HeaderRight />
      </Animated.View>
    </View>
  );
}
