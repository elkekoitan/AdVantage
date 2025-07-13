import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

export interface SplitTextProps {
  text: string;
  style?: any;
  delay?: number;
  duration?: number;
  splitType?: "chars" | "words";
  onAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  style,
  delay = 100,
  duration = 600,
  splitType = "chars",
  onAnimationComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const splitText = () => {
    if (splitType === "words") {
      return text.split(" ");
    }
    return text.split("");
  };

  const AnimatedChar: React.FC<{ char: string; index: number }> = ({ char, index }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

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

        // Call completion callback for the last character
        if (index === splitText().length - 1) {
          const totalDelay = index * delay + duration;
          setTimeout(() => {
            onAnimationComplete?.();
          }, totalDelay);
        }
      }
    }, [isVisible, index, opacity, translateY]);

    return (
      <Animated.Text style={[animatedStyle, style]}>
        {char === " " ? "\u00A0" : char}
      </Animated.Text>
    );
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {splitText().map((char, index) => (
        <AnimatedChar key={index} char={char} index={index} />
      ))}
    </View>
  );
};

export default SplitText;