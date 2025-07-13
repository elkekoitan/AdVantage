import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  style?: object;
}

export default function Orb({
  hue = 240,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  style,
}: OrbProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  // Convert hue to HSL color
  const getHSLColor = (h: number, s: number = 70, l: number = 60) => {
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  useEffect(() => {
    // Start rotation animation if rotateOnHover is enabled
    if (rotateOnHover || forceHoverState) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
    }

    // Animate scale and opacity based on hover state
    if (forceHoverState) {
      scale.value = withTiming(1 + hoverIntensity, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0.8, { duration: 300 });
    }
  }, [rotateOnHover, forceHoverState, hoverIntensity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.orb, animatedStyle]}>
        <View style={[styles.innerOrb, { backgroundColor: getHSLColor(hue, 70, 60) }]} />
        <View style={[styles.outerGlow, { backgroundColor: getHSLColor(hue, 80, 70) }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerOrb: {
    width: '60%',
    height: '60%',
    borderRadius: 1000,
    position: 'absolute',
  },
  outerGlow: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    opacity: 0.3,
  },
});

export { Orb };