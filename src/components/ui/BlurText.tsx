import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

type BlurTextProps = {
  text?: string;
  delay?: number;
  style?: any;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  onAnimationComplete?: () => void;
  duration?: number;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = "",
  delay = 200,
  style,
  animateBy = "words",
  direction = "top",
  onAnimationComplete,
  duration = 600,
}) => {
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const AnimatedSegment: React.FC<{ segment: string; index: number }> = ({ segment, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(direction === "top" ? -20 : 20);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
      };
    });

    useEffect(() => {
      if (isVisible) {
        opacity.value = withDelay(
          index * delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.cubic),
          })
        );
        translateY.value = withDelay(
          index * delay,
          withTiming(0, {
            duration,
            easing: Easing.out(Easing.cubic),
          })
        );

        // Call completion callback for the last segment
        if (index === elements.length - 1) {
          const totalDelay = index * delay + duration;
          setTimeout(() => {
            onAnimationComplete?.();
          }, totalDelay);
        }
      }
    }, [isVisible, index, opacity, translateY]);

    return (
      <Animated.Text style={[animatedStyle, style]}>
        {segment === " " ? "\u00A0" : segment}
        {animateBy === "words" && index < elements.length - 1 && "\u00A0"}
      </Animated.Text>
    );
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {elements.map((segment, index) => (
        <AnimatedSegment key={index} segment={segment} index={index} />
      ))}
    </View>
  );
};

export default BlurText;