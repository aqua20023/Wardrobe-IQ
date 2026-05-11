import React, { useEffect, useMemo } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  useSharedValue,
  Easing,
  interpolateColor,
  useDerivedValue
} from "react-native-reanimated";
import { type WeatherCondition } from "../../api/weather";
import { colors } from "../../theme/editorial";
import { useAtmosphere } from "../../providers/AtmosphereProvider";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function WeatherAtmosphere({ condition }: { condition?: WeatherCondition }) {
  const { theme, weatherOverride } = useAtmosphere();
  
  // Resolve active color vectors
  const particleColor = weatherOverride?.ambientColor || theme.particleColor;
  const activeOpacity = theme.ambientOpacity + (weatherOverride?.extraOpacity || 0);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Base Time Gradient */}
      {theme.gradient.some(c => c !== "transparent") && (
        <LinearGradient
          colors={theme.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Weather Tints */}
      {weatherOverride?.tint && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: weatherOverride.tint }]} />
      )}

      {/* Dynamic Weather Particles Layer */}
      {condition === "rainy" && <RainEffect color={particleColor} />}
      {condition === "snowy" && <SnowEffect color={particleColor} />}
      {condition === "sunny" && <SunEffect glowColor={theme.glowColor || colors.gold} />}
      {condition === "cloudy" && <CloudEffect />}
      {condition === "misty" && <CloudEffect isFog />}
      {condition === "stormy" && <StormEffect />}

      {/* Master Ambient Vignette / Fade */}
      {activeOpacity > 0 && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.ambientColor, opacity: activeOpacity * 0.5 }]} />
      )}
    </View>
  );
}

function RainEffect({ color }: { color: string }) {
  const count = 12;
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <RainDrop key={i} delay={i * 250} color={color} />
      ))}
    </View>
  );
}

function RainDrop({ delay, color }: { delay: number, color: string }) {
  const translateY = useSharedValue(-40);
  const left = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const duration = useMemo(() => 700 + Math.random() * 300, []);

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
          height: 30,
          backgroundColor: color || colors.silverSoft,
          opacity: 0.18,
        },
        animatedStyle,
      ]}
    />
  );
}

function SnowEffect({ color }: { color: string }) {
  const count = 10;
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: count }).map((_, i) => (
        <SnowFlake key={i} delay={i * 500} color={color} />
      ))}
    </View>
  );
}

function SnowFlake({ delay, color }: { delay: number, color: string }) {
  const translateY = useSharedValue(-10);
  const translateX = useSharedValue(0);
  const left = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const duration = useMemo(() => 4500 + Math.random() * 3000, []);
  const drift = useMemo(() => 20 + Math.random() * 20, []);
  const size = useMemo(() => 1.5 + Math.random() * 2.5, []);

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
          backgroundColor: color || colors.ivory,
          opacity: 0.25,
        },
        animatedStyle,
      ]}
    />
  );
}

function SunEffect({ glowColor }: { glowColor: string }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.03 + (pulse.value - 1) * 0.15 
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: -120,
          right: -100,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: glowColor,
        },
        animatedStyle
      ]}
    />
  );
}

function CloudEffect({ isFog = false }: { isFog?: boolean }) {
  const translate = useSharedValue(-200);

  useEffect(() => {
    translate.value = withRepeat(
      withTiming(SCREEN_WIDTH + 50, { duration: isFog ? 18000 : 30000, easing: Easing.linear }),
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
          top: isFog ? "35%" : 30,
          width: 220,
          height: isFog ? 240 : 120,
          borderRadius: 110,
          backgroundColor: colors.graphite,
          opacity: isFog ? 0.12 : 0.06,
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
        withTiming(0.12, { duration: 50 }),
        withTiming(0, { duration: 120 }),
        withDelay(80, withTiming(0.08, { duration: 40 })),
        withTiming(0, { duration: 400 })
      );
      const next = 5000 + Math.random() * 7000;
      const timer = setTimeout(triggerFlash, next);
      return () => clearTimeout(timer);
    };
    
    const timerId = triggerFlash();
    return () => {
      if (typeof timerId === "function") timerId();
    };
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
