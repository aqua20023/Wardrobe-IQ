import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors, radii } from "../../theme/editorial";

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  const opacity = useRef(new Animated.Value(0.36)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.88, duration: 820, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.36, duration: 820, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.wrapper}>
      {Array.from({ length: rows }).map((_, index) => (
        <Animated.View key={index} style={[styles.row, { opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12
  },
  row: {
    height: 104,
    borderRadius: radii.lg,
    backgroundColor: colors.charcoalHigh,
    borderWidth: 1,
    borderColor: colors.border
  }
});
