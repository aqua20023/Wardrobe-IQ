import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  useSharedValue,
  Easing
} from "react-native-reanimated";
import { type WeatherCondition } from "../../api/weather";
import { colors } from "../../theme/editorial";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function WeatherAtmosphere({ condition }: { condition?: WeatherCondition }) {
  if (!condition || condition === "unknown") return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {condition === "rainy" && <RainEffect />}
      {condition === "snowy" && <SnowEffect />}
      {condition === "sunny" && <SunEffect />}
      {condition === "cloudy" && <CloudEffect />}
      {condition === "misty" && <CloudEffect isFog />}
      {condition === "stormy" && <StormEffect />}
    </View>
  );
}

function RainEffect() {
  const count = 15; // Moderate particles for battery perf
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <RainDrop key={i} delay={i * 200} />
      ))}
    </View>
  );
}

function RainDrop({ delay }: { delay: number }) {
  const translateY = useSharedValue(-20);
  const left = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const duration = useMemo(() => 800 + Math.random() * 400, []);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left,
          width: 1,
          height: 20,
          backgroundColor: colors.silverSoft,
          opacity: 0.25,
        },
        animatedStyle,
      ]}
    />
  );
}

function SnowEffect() {
  const count = 12;
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <SnowFlake key={i} delay={i * 400} />
      ))}
    </View>
  );
}

function SnowFlake({ delay }: { delay: number }) {
  const translateY = useSharedValue(-10);
  const translateX = useSharedValue(0);
  const left = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const duration = useMemo(() => 4000 + Math.random() * 3000, []);
  const drift = useMemo(() => 20 + Math.random() * 30, []);
  const size = useMemo(() => 2 + Math.random() * 3, []);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_HEIGHT, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(drift, { duration: duration / 3, easing: Easing.inOut(Easing.sin) }),
        withTiming(-drift, { duration: duration / 3, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value }
    ]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.ivory,
          opacity: 0.3,
        },
        animatedStyle,
      ]}
    />
  );
}

function SunEffect() {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.12, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.05 + (pulse.value - 1) * 0.2 // very faint ambient
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: colors.gold,
        },
        animatedStyle
      ]}
    />
  );
}

function CloudEffect({ isFog = false }: { isFog?: boolean }) {
  const translate = useSharedValue(-150);

  useEffect(() => {
    translate.value = withRepeat(
      withTiming(SCREEN_WIDTH, { duration: isFog ? 15000 : 25000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value }]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: isFog ? "40%" : 20,
          width: 200,
          height: isFog ? 200 : 100,
          borderRadius: 100,
          backgroundColor: colors.graphite,
          opacity: isFog ? 0.15 : 0.08,
          // Using dynamic opacity creates the mist feel
        },
        animatedStyle
      ]}
    />
  );
}

function StormEffect() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const triggerFlash = () => {
      opacity.value = withSequence(
        withTiming(0.15, { duration: 50 }),
        withTiming(0, { duration: 100 }),
        withDelay(100, withTiming(0.1, { duration: 50 })),
        withTiming(0, { duration: 300 })
      );
      // Random intervals between 4 to 10 seconds
      const next = 4000 + Math.random() * 6000;
      const timer = setTimeout(triggerFlash, next);
      return () => clearTimeout(timer);
    };
    
    const cleanup = triggerFlash();
    return typeof cleanup === "function" ? cleanup : undefined;
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.ivory },
        animatedStyle
      ]}
    />
  );
}
