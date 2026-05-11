import type React from "react";
import { useRef } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, "style" | "children"> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

export function PressableScale({ children, style, pressedScale = 0.98, disabled, onPressIn, onPressOut, ...props }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(toValue: number) {
    Animated.timing(scale, {
      toValue,
      duration: 120,
      useNativeDriver: true
    }).start();
  }

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event) => {
        animate(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }], opacity: disabled ? 0.48 : 1 }]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
